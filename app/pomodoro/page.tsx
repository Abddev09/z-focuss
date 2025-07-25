"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, RotateCcw, SkipForward, Settings, Timer, CheckSquare } from "lucide-react"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { useTimer } from "@/contexts/timer-context"
import type { Task as BackendTask } from "@/types" // types.ts dan Task ni BackendTask deb import qilish
import apiClient from "@/lib/api"
import { formatTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

// Frontendda ishlatiladigan Task interfeysi
// BackendTask'dagi 'done' ni olib tashlab, 'completed' ni qo'shamiz
interface Task extends Omit<BackendTask, "done"> {
  completed: boolean
}

export default function PomodoroPage() {
  const [tasks, setTasks] = useState<Task[]>([]) // Yangi Task interfeysidan foydalanamiz
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [notificationSound, setNotificationSound] = useState<string>("/sounds/notification.mp3") // Standart zaxira
  const { timerState, settings, startTimer, pauseTimer, resetTimer, skipTimer } = useTimer()
  const { toast } = useToast()

  useEffect(() => {
    loadTasks()
    loadNotificationPreferences()
  }, [])

  // Taymer tugashi uchun tostni ko'rsatish (ovoz endi timer-context.tsx tomonidan boshqariladi)
  useEffect(() => {
    if (timerState.timeLeft === 0 && timerState.totalTime > 0) {
      const modeText = getTimerModeText()
      toast({
        title: `${modeText} Complete!`,
        description: `Your ${modeText.toLowerCase()} session has finished.`,
      })
    }
  }, [timerState.timeLeft, timerState.totalTime, toast])

  const loadTasks = async () => {
    try {
      const rawTasks = await apiClient.getTasks() // rawTasks endi BackendTask[] turida (ya'ni 'done' xususiyatiga ega)
      // Backenddan kelgan 'done' ni frontenddagi 'completed' ga xaritalash
      const mappedTasks: Task[] = rawTasks.map((task) => ({
        ...task,
        completed: task.done,
      }))
      setTasks(mappedTasks.filter((task) => !task.completed)) // Faqat bajarilmagan vazifalarni ko'rsatish uchun filterlash
    } catch (error) {
      console.error("Vazifalarni yuklashda xato:", error)
      toast({
        title: "Xato",
        description: "Vazifalarni yuklashda xato yuz berdi.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadNotificationPreferences = () => {
    const savedSoundUrl = localStorage.getItem("selectedSoundUrl")
    if (savedSoundUrl) {
      console.log("Maxsus bildirishnoma ovozi ishlatilmoqda:", savedSoundUrl)
      setNotificationSound(savedSoundUrl)
    } else {
      console.log("Standart bildirishnoma ovozi ishlatilmoqda")
    }
  }

  const testNotificationSound = () => {
    const audio = new Audio(notificationSound)
    audio.volume = 0.7
    audio.play().catch((err) => {
      console.error("Test ovozi ijro etish muvaffaqiyatsiz tugadi:", notificationSound, err)
      if (notificationSound !== "/sounds/notification.mp3") {
        const fallbackAudio = new Audio("/sounds/notification.mp3")
        fallbackAudio.volume = 0.7
        fallbackAudio.play().catch(console.error)
      }
    })
  }

  const handleStart = () => {
    const taskIdToSend = selectedTaskId === "none" ? undefined : selectedTaskId
    startTimer(taskIdToSend)
  }

  const handlePause = () => {
    pauseTimer()
  }

  const handleReset = () => {
    resetTimer()
  }

  const handleSkip = () => {
    skipTimer()
  }

  const getTimerModeText = () => {
    switch (timerState.mode) {
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

  const getTimerModeColor = () => {
    switch (timerState.mode) {
      case "work":
        return "bg-gradient-to-br from-blue-500 to-purple-600"
      case "break":
        return "bg-gradient-to-br from-green-500 to-teal-600"
      case "longBreak":
        return "bg-gradient-to-br from-orange-500 to-red-600"
      default:
        return "bg-gradient-to-br from-blue-500 to-purple-600"
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Pomodoro Timer</h1>
              <p className="text-sm md:text-base text-muted-foreground">Stay focused and productive with the Pomodoro Technique</p>
            </div>

            <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
              {/* Timer Card */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-xl overflow-hidden">
                  <div className={`${getTimerModeColor()} p-6 md:p-8 text-white`}>
                    <div className="text-center">
                      <Badge variant="secondary" className="mb-4 text-xs md:text-sm px-3 py-1">
                        {getTimerModeText()}
                      </Badge>
                      <div className="mb-6">
                        <div
                          className={`text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-mono font-bold mb-4 ${
                            timerState.isRunning ? "timer-pulse" : ""
                          } leading-none`}
                        >
                          {formatTime(timerState.timeLeft)}
                        </div>
                        <Progress
                          value={((timerState.totalTime - timerState.timeLeft) / timerState.totalTime) * 100}
                          className="h-2 md:h-3 bg-white/20"
                        />
                      </div>

                      {/* Timer Controls */}
                      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                        {!timerState.isRunning ? (
                          <Button
                            onClick={handleStart}
                            size="lg"
                            variant="secondary"
                            className="flex items-center space-x-2 px-6 py-3 text-base"
                          >
                            <Play className="w-4 h-4 md:w-5 md:h-5" />
                            <span>Start</span>
                          </Button>
                        ) : (
                          <Button
                            onClick={handlePause}
                            size="lg"
                            variant="secondary"
                            className="flex items-center space-x-2 px-6 py-3 text-base"
                          >
                            <Pause className="w-4 h-4 md:w-5 md:h-5" />
                            <span>Pause</span>
                          </Button>
                        )}
                        <Button
                          onClick={handleReset}
                          size="lg"
                          variant="outline"
                          className="flex items-center space-x-2 bg-white/10 border-white/20 text-white hover:bg-white/20 px-4 py-3 text-base"
                        >
                          <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                          <span className="hidden sm:inline">Reset</span>
                        </Button>
                        <Button
                          onClick={handleSkip}
                          size="lg"
                          variant="outline"
                          className="flex items-center space-x-2 bg-white/10 border-white/20 text-white hover:bg-white/20 px-4 py-3 text-base"
                        >
                          <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
                          <span className="hidden sm:inline">Skip</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Side Panel */}
              <div className="space-y-4 md:space-y-6">
                {/* Task Selection */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                      <CheckSquare className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Focus Task</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="animate-pulse h-10 bg-muted rounded"></div>
                    ) : (
                      <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                        <SelectTrigger className="text-sm md:text-base h-10 md:h-11">
                          <SelectValue placeholder="Select a task to focus on" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No specific task</SelectItem>
                          {tasks.map((task) => (
                            <SelectItem key={task.id} value={task.id}>
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    task.priority === "HIGH"
                                      ? "bg-red-500"
                                      : task.priority === "MEDIUM"
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                  }`}
                                />
                                <span className="truncate text-sm">{task.title}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                      <Settings className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Notification</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    <div className="space-y-1 md:space-y-2">
                      <label className="text-xs md:text-sm font-medium">Notification Sound</label>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {notificationSound === "/sounds/notification.mp3"
                          ? "Default notification sound"
                          : "Custom sound from media library"}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={testNotificationSound}
                        className="flex-1 bg-transparent text-xs md:text-sm py-2"
                      >
                        Test Sound
                      </Button>
                      <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent text-xs md:text-sm py-2">
                        <a href="/media">Change Sound</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Timer Settings */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                      <Timer className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Timer Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    <div className="space-y-1 md:space-y-2">
                      <label className="text-xs md:text-sm font-medium">Work Duration</label>
                      <p className="text-xs md:text-sm text-muted-foreground">{Math.floor(settings.workDuration / 60)} minutes</p>
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      <label className="text-xs md:text-sm font-medium">Short Break</label>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {Math.floor(settings.shortBreakDuration / 60)} minutes
                      </p>
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      <label className="text-xs md:text-sm font-medium">Long Break</label>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {Math.floor(settings.longBreakDuration / 60)} minutes
                      </p>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent text-xs md:text-sm py-2" asChild>
                      <a href="/settings">Customize Settings</a>
                    </Button>
                  </CardContent>
                </Card>

                {/* Session Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base md:text-lg">
                      <Timer className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Session Info</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs md:text-sm text-muted-foreground">Mode</span>
                        <Badge variant={timerState.mode === "work" ? "default" : "secondary"} className="text-xs">
                          {getTimerModeText()}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs md:text-sm text-muted-foreground">Status</span>
                        <Badge variant={timerState.isRunning ? "default" : "outline"} className="text-xs">
                          {timerState.isRunning ? "Running" : "Paused"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs md:text-sm text-muted-foreground">Progress</span>
                        <span className="text-xs md:text-sm font-medium">
                          {Math.round(((timerState.totalTime - timerState.timeLeft) / timerState.totalTime) * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
