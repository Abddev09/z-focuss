"use client"
import type React from "react"
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef, // Import useRef
} from "react"
import type { TimerState, AppSettings } from "@/types"
import apiClient from "@/lib/api"
// useToast importi olib tashlandi, chunki tostlar endi PomodoroPage tomonidan boshqariladi

interface TimerContextType {
  timerState: TimerState
  settings: AppSettings
  startTimer: (taskId?: string) => void
  pauseTimer: () => void
  resetTimer: () => void
  skipTimer: () => void
  updateSettings: (newSettings: Partial<AppSettings>) => void
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
  // useToast hooki bu yerdan olib tashlandi

  // Taymer tugashi ovozi uchun audio ref, kontekst ichida boshqariladi
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Hozirda ijro etilayotgan har qanday audioni to'xtatish funksiyasi
  const stopCurrentAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
  }, [])

  // Bildirishnoma ovozini ijro etish funksiyasi, agar mavjud bo'lsa, localStorage'dan maxsus ovozni ishlatadi
  const playNotificationSound = useCallback(() => {
    if (typeof window === "undefined" || !settings.soundEnabled) {
      return // Brauzerda bo'lmasa yoki ovoz o'chirilgan bo'lsa, ovoz ijro etilmaydi
    }

    stopCurrentAudio() // Yangi ovozni boshlashdan oldin ijro etilayotgan har qanday ovozni to'xtating

    const savedSoundUrl = localStorage.getItem("selectedSoundUrl")
    const soundToPlay = savedSoundUrl || "/sounds/notification.mp3"

    const audio = new Audio(soundToPlay)
    audio.volume = 0.7 // Standart ovoz balandligini o'rnating
    audioRef.current = audio // Joriy audio misoliga havolani saqlang

    audio.addEventListener("ended", () => {
      audioRef.current = null // Audio tugagach refni tozalang
    })
    audio.addEventListener("error", (e) => {
      console.error("Audio ijro etishda xato:", soundToPlay, e)
      audioRef.current = null
      // Agar maxsus ovoz yuklanmasa yoki ijro etilmasa, standart ovozga qayting
      if (soundToPlay !== "/sounds/notification.mp3") {
        const fallbackAudio = new Audio("/sounds/notification.mp3")
        fallbackAudio.volume = 0.7
        audioRef.current = fallbackAudio
        fallbackAudio.play().catch(console.error)
      }
    })

    audio.play().catch((err) => {
      console.error("Audio ijro etish muvaffaqiyatsiz tugadi:", soundToPlay, err)
      // Agar ijro etish muvaffaqiyatsiz tugasa (masalan, foydalanuvchi imo-ishorasi talab qilinsa), standart ovozga qayting
      if (soundToPlay !== "/sounds/notification.mp3") {
        const fallbackAudio = new Audio("/sounds/notification.mp3")
        fallbackAudio.volume = 0.7
        audioRef.current = fallbackAudio
        fallbackAudio.play().catch(console.error)
      }
    })
  }, [settings.soundEnabled, stopCurrentAudio]) // useCallback uchun bog'liqliklar

  // Taymer nolga yetganda chaqiriladigan callback
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

      // Ovoz bu yerda ijro etiladi
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

      // Ovoz bu yerda ijro etiladi
      if (settings.soundEnabled) {
        playNotificationSound()
      }
    }
  }, [timerState, sessionCount, settings, playNotificationSound]) // playNotificationSound bog'liqliklarga qo'shildi

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
  }, [timerState.isRunning, timerState.timeLeft]) // handleTimerComplete bog'liqliklarga qo'shildi [^2]

  // Taymer rejimi matni uchun yordamchi funksiya (agar boshqa joyda kerak bo'lsa, utils'ga ko'chirilishi mumkin)
  const getTimerModeText = (mode: TimerState["mode"]) => {
    switch (mode) {
      case "work":
        return "Focus Time"
      case "break":
        return "Short Break"
      case "longBreak":
        return "Long Break"
      default:
        return "Focus Time"
    }
  }

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
        // API chaqiruvlariga bevosita bog'liq bo'lgan xatolar uchun tostlar bu yerda qoladi
        // va umumiy taymer tugashi bildirishnomasi emas.
        // Toast komponenti PomodoroPage'da import qilingan, shuning uchun uni bu yerda bevosita ishlata olmaymiz.
        // Agar API xatolari uchun tostlar kerak bo'lsa, PomodoroPage'dan tost funksiyasini o'tkazishingiz
        // yoki useToast'ni bu yerda qayta import qilishingiz kerak bo'ladi. Hozircha, console.error'ni qoldiraman.
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

  // Komponent (TimerProvider) o'chirilganda audioni to'xtating
  useEffect(() => {
    return () => {
      stopCurrentAudio()
    }
  }, [stopCurrentAudio])

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
