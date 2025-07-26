"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import type { TimerState, AppSettings } from "@/types"
import apiClient from "@/lib/api"

interface TimerContextType {
  timerState: TimerState
  settings: AppSettings
  startTimer: (taskId?: string) => void
  pauseTimer: () => void
  resetTimer: () => void
  skipTimer: () => void
  updateSettings: (newSettings: Partial<AppSettings>) => void
  stopAllAudio: () => void // Yangi funksiya qo'shildi
  playTestSound: () => void // Test ovozi uchun yangi funksiya
}

const defaultSettings: AppSettings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  notificationsEnabled: true,
  theme: "system",
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    timeLeft: defaultSettings.workDuration,
    totalTime: defaultSettings.workDuration,
    mode: "work",
  })
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [sessionCount, setSessionCount] = useState(0)

  // Barcha audio elementlarini boshqarish uchun ref
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Barcha audioni to'xtatish funksiyasi
  const stopAllAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
  }, [])

  // Bildirishnoma ovozini ijro etish funksiyasi
  const playNotificationSound = useCallback(() => {
    if (typeof window === "undefined" || !settings.soundEnabled) {
      return
    }

    stopAllAudio() // Avval barcha ovozlarni to'xtatish

    const savedSoundUrl = localStorage.getItem("selectedSoundUrl")
    const soundToPlay = savedSoundUrl || "/sounds/notification.mp3"

    const audio = new Audio(soundToPlay)
    audio.volume = 0.7
    audioRef.current = audio

    audio.addEventListener("ended", () => {
      audioRef.current = null
    })

    audio.addEventListener("error", (e) => {
      console.error("Audio ijro etishda xato:", soundToPlay, e)
      audioRef.current = null

      // Standart ovozga qaytish
      if (soundToPlay !== "/sounds/notification.mp3") {
        const fallbackAudio = new Audio("/sounds/notification.mp3")
        fallbackAudio.volume = 0.7
        audioRef.current = fallbackAudio
        fallbackAudio.play().catch(console.error)
      }
    })

    audio.play().catch((err) => {
      console.error("Audio ijro etish muvaffaqiyatsiz tugadi:", soundToPlay, err)

      if (soundToPlay !== "/sounds/notification.mp3") {
        const fallbackAudio = new Audio("/sounds/notification.mp3")
        fallbackAudio.volume = 0.7
        audioRef.current = fallbackAudio
        fallbackAudio.play().catch(console.error)
      }
    })
  }, [settings.soundEnabled, stopAllAudio])

  // Test ovozi uchun funksiya
  const playTestSound = useCallback(() => {
    if (typeof window === "undefined") {
      return
    }

    stopAllAudio() // Avval barcha ovozlarni to'xtatish

    const savedSoundUrl = localStorage.getItem("selectedSoundUrl")
    const soundToPlay = savedSoundUrl || "/sounds/notification.mp3"

    const audio = new Audio(soundToPlay)
    audio.volume = 0.7
    audioRef.current = audio

    audio.addEventListener("ended", () => {
      audioRef.current = null
    })

    audio.addEventListener("error", (e) => {
      console.error("Test ovozi ijro etishda xato:", soundToPlay, e)
      audioRef.current = null

      // Standart ovozga qaytish
      if (soundToPlay !== "/sounds/notification.mp3") {
        const fallbackAudio = new Audio("/sounds/notification.mp3")
        fallbackAudio.volume = 0.7
        audioRef.current = fallbackAudio
        fallbackAudio.play().catch(console.error)
      }
    })

    audio.play().catch((err) => {
      console.error("Test ovozi ijro etish muvaffaqiyatsiz tugadi:", soundToPlay, err)

      if (soundToPlay !== "/sounds/notification.mp3") {
        const fallbackAudio = new Audio("/sounds/notification.mp3")
        fallbackAudio.volume = 0.7
        audioRef.current = fallbackAudio
        fallbackAudio.play().catch(console.error)
      }
    })
  }, [stopAllAudio])

  // Taymer tugashi callbacki
  const handleTimerComplete = useCallback(async () => {
    if (timerState.mode === "work") {
      if (timerState.currentSession) {
        try {
          await apiClient.completePomodoroSession(timerState.currentSession.id)
        } catch (error) {
          console.error("Sessiyani yakunlashda xato:", error)
        }
      }

      const newSessionCount = sessionCount + 1
      setSessionCount(newSessionCount)

      const isLongBreak = newSessionCount % settings.sessionsUntilLongBreak === 0
      const breakDuration = isLongBreak ? settings.longBreakDuration : settings.shortBreakDuration
      const breakMode = isLongBreak ? "longBreak" : "break"

      setTimerState({
        isRunning: settings.autoStartBreaks,
        timeLeft: breakDuration,
        totalTime: breakDuration,
        mode: breakMode,
      })

      // Ovoz ijro etish
      if (settings.soundEnabled) {
        playNotificationSound()
      }
    } else {
      // Tanaffus tugadi
      setTimerState({
        isRunning: settings.autoStartPomodoros,
        timeLeft: settings.workDuration,
        totalTime: settings.workDuration,
        mode: "work",
      })

      // Ovoz ijro etish
      if (settings.soundEnabled) {
        playNotificationSound()
      }
    }
  }, [timerState, sessionCount, settings, playNotificationSound])

  // Asosiy taymer interval effekti
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (timerState.isRunning && timerState.timeLeft > 0) {
      interval = setInterval(() => {
        setTimerState((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }))
      }, 1000)
    } else if (timerState.timeLeft === 0) {
      handleTimerComplete()
    }

    return () => clearInterval(interval)
  }, [timerState.isRunning, timerState.timeLeft, handleTimerComplete])

  const startTimer = async (taskId?: string) => {
    if (timerState.mode === "work" && !timerState.currentSession) {
      try {
        const durationInMinutes = Math.floor(settings.workDuration / 60)
        const payload: { duration: number; taskId?: string } = {
          duration: durationInMinutes,
        }

        if (taskId && taskId.trim() !== "" && taskId !== "none") {
          payload.taskId = taskId
        }

        const session = await apiClient.startPomodoroSession(payload)
        setTimerState((prev) => ({
          ...prev,
          isRunning: true,
          currentSession: session,
        }))
      } catch (error: any) {
        console.error("Sessiyani boshlashda xato:", error?.response?.data || error)
      }
    } else {
      setTimerState((prev) => ({
        ...prev,
        isRunning: true,
      }))
    }
  }

  const pauseTimer = () => {
    setTimerState((prev) => ({
      ...prev,
      isRunning: false,
    }))
  }

  const resetTimer = () => {
    const duration =
      timerState.mode === "work"
        ? settings.workDuration
        : timerState.mode === "break"
          ? settings.shortBreakDuration
          : settings.longBreakDuration

    setTimerState({
      isRunning: false,
      timeLeft: duration,
      totalTime: duration,
      mode: timerState.mode,
    })
  }

  const skipTimer = () => {
    setTimerState((prev) => ({
      ...prev,
      timeLeft: 0,
    }))
  }

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))

    if (!timerState.isRunning) {
      const duration =
        timerState.mode === "work"
          ? newSettings.workDuration || settings.workDuration
          : timerState.mode === "break"
            ? newSettings.shortBreakDuration || settings.shortBreakDuration
            : newSettings.longBreakDuration || settings.longBreakDuration

      setTimerState((prev) => ({
        ...prev,
        timeLeft: duration,
        totalTime: duration,
      }))
    }
  }

  // Komponent o'chirilganda audioni to'xtatish
  useEffect(() => {
    return () => {
      stopAllAudio()
    }
  }, [stopAllAudio])

  return (
    <TimerContext.Provider
      value={{
        timerState,
        settings,
        startTimer,
        pauseTimer,
        resetTimer,
        skipTimer,
        updateSettings,
        stopAllAudio,
        playTestSound,
      }}
    >
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider")
  }
  return context
}
