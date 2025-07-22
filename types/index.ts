export interface User {
  id: string
  name: string
  email: string
  username: string // Bu xususiyat qo'shildi
  avatar?: string
  bio?: string
  theme: "light" | "dark"
  soundEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  done: boolean // Backenddan 'done' keladi deb hisoblab o'zgartirildi
  priority: "LOW" | "MEDIUM" | "HIGH"
  dueDate?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface PomodoroSession {
  id: string
  duration: number
  completedAt?: string
  taskId?: string
  task?: Task
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Media {
  id: string
  name: string
  url: string
  type: "BACKGROUND" | "SOUND"
  userId?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface UserStats {
  totalTasks: number
  completedTasks: number
  totalPomodoroSessions: number
  totalFocusTime: number
  streakDays: number
  todayTasks: number
  todayCompletedTasks: number
  todayPomodoroSessions: number
  todayFocusTime: number
}

export interface PomodoroStats {
  totalSessions: number
  totalFocusTime: number
  averageSessionLength: number
  sessionsThisWeek: number
  focusTimeThisWeek: number
  dailyStats: {
    date: string
    sessions: number
    focusTime: number
  }[]
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
}

export type Priority = "LOW" | "MEDIUM" | "HIGH"
export type Theme = "light" | "dark" | "system"
export type MediaType = "BACKGROUND" | "SOUND"

export interface TimerState {
  isRunning: boolean
  timeLeft: number
  totalTime: number
  currentSession?: PomodoroSession
  mode: "work" | "break" | "longBreak"
}

export interface AppSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  soundEnabled: boolean
  notificationsEnabled: boolean
  theme: Theme
}
