"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Timer, CheckSquare, Target, TrendingUp, Clock, Play, Plus } from "lucide-react"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { useAuth } from "@/contexts/auth-context"
import { useTimer } from "@/contexts/timer-context"
import type { UserStats, Task as BackendTask } from "@/types" // types.ts dan Task ni BackendTask deb import qilish
import apiClient from "@/lib/api"
import { formatTime } from "@/lib/utils"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

// Frontendda ishlatiladigan Task interfeysi
// BackendTask'dagi 'done' ni olib tashlab, 'completed' ni qo'shamiz
interface Task extends Omit<BackendTask, "done"> {
  completed: boolean
}

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [recentTasks, setRecentTasks] = useState<Task[]>([]) // Yangi Task interfeysidan foydalanamiz
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { timerState, startTimer } = useTimer()
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsData, rawTasks] = await Promise.all([apiClient.getUserStats(), apiClient.getTasks()])
      setStats(statsData)

      // Backenddan kelgan 'done' ni frontenddagi 'completed' ga xaritalash
      const mappedTasks: Task[] = rawTasks.map((task) => ({
        ...task,
        completed: task.done,
      }))

      // Faqat bajarilmagan vazifalarni ko'rsatish uchun filterlash
      setRecentTasks(mappedTasks.filter((task) => !task.completed).slice(0, 5))
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleQuickStart = () => {
    startTimer()
    toast({
      title: "Pomodoro Started!",
      description: "Focus time begins now. Stay productive!",
    })
  }

  // Task completed holatini tekshirish uchun helper function
  const isTaskCompleted = (task: Task) => {
    return task.completed // Endi 'completed' xususiyati mavjud
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
            <p className="text-muted-foreground">Here's your productivity overview for today.</p>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleQuickStart} size="lg" className="flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Quick Start Pomodoro</span>
              </Button>
              <Link href="/tasks">
                <Button variant="outline" size="lg" className="flex items-center space-x-2 bg-transparent">
                  <Plus className="w-5 h-5" />
                  <span>Add Task</span>
                </Button>
              </Link>
              <Link href="/media">
                <Button variant="outline" size="lg" className="flex items-center space-x-2 bg-transparent">
                  <Target className="w-5 h-5" />
                  <span>Customize Workspace</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Focus Time</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(stats?.todayFocusTime || 0)}</div>
                <p className="text-xs text-muted-foreground">{stats?.todayPomodoroSessions || 0} sessions completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.todayCompletedTasks || 0}/{stats?.todayTasks || 0}
                </div>
                <div className="mt-2">
                  <Progress
                    value={stats?.todayTasks ? (stats.todayCompletedTasks / stats.todayTasks) * 100 : 0}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.streakDays || 0}</div>
                <p className="text-xs text-muted-foreground">days of productivity</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalPomodoroSessions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {formatTime(stats?.totalFocusTime || 0)} total focus time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Current Timer & Recent Tasks */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Timer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Timer className="w-5 h-5" />
                  <span>Current Session</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timerState.isRunning ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-mono font-bold mb-2">{formatTime(timerState.timeLeft)}</div>
                      <Badge variant={timerState.mode === "work" ? "default" : "secondary"}>
                        {timerState.mode === "work" ? "Focus Time" : "Break Time"}
                      </Badge>
                    </div>
                    <Progress
                      value={((timerState.totalTime - timerState.timeLeft) / timerState.totalTime) * 100}
                      className="h-3"
                    />
                    <div className="flex justify-center">
                      <Link href="/pomodoro">
                        <Button variant="outline">Go to Timer</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Timer className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No active session</p>
                    <Button onClick={handleQuickStart}>Start Pomodoro</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="w-5 h-5" />
                    <span>Recent Tasks</span>
                  </div>
                  <Link href="/tasks">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTasks.length > 0 ? (
                  <div className="space-y-3">
                    {recentTasks.map((task) => (
                      <div key={task.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            task.priority === "HIGH"
                              ? "bg-red-500"
                              : task.priority === "MEDIUM"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              isTaskCompleted(task) ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.dueDate && (
                            <p className="text-xs text-muted-foreground">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Badge variant={isTaskCompleted(task) ? "secondary" : "outline"}>
                          {isTaskCompleted(task) ? "Done" : "Pending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No tasks yet</p>
                    <Link href="/tasks">
                      <Button>Create Your First Task</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
