"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  Calendar,
  AlertCircle,
} from "lucide-react"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { useToast } from "@/hooks/use-toast"
import { taskSchema, type TaskFormData } from "@/schemas/task"
import apiClient from "@/lib/api"
import { formatDate } from "@/lib/utils"
import type { Task as BackendTask } from "@/types"

interface Task extends Omit<BackendTask, "done"> {
  completed: boolean
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")
  const [priorityFilter, setPriorityFilter] = useState<"all" | "HIGH" | "MEDIUM" | "LOW">("all")

  const { toast } = useToast()

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
    },
  })

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const rawTasks = await apiClient.getTasks()
      const mappedTasks = rawTasks.map((task) => ({
        ...task,
        completed: task.done,
        // dueDate frontend da localStorage yoki state da saqlanishi kerak
        // Hozircha backend dan kelgan data asosida ishlaymiz
      }))
      setTasks(mappedTasks)
    } catch (error) {
      console.error("Failed to load tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load tasks.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: TaskFormData) => {
    try {
      // Backend uchun data (dueDate ni chiqarib tashlash)
      const cleanedData = {
        title: data.title,
        description: data.description || undefined,
        priority: data.priority || "MEDIUM",
      }

      console.log("✅ Cleaned data for backend:", cleanedData)

      if (editingTask) {
        const updated = await apiClient.updateTask(editingTask.id, cleanedData)
        const mapped = { 
          ...updated, 
          completed: updated.done,
          dueDate: data.dueDate || undefined // Frontend da dueDate ni saqlab qolish
        }
        setTasks(tasks.map((t) => (t.id === editingTask.id ? mapped : t)))
        toast({
          title: "Task Updated",
          description: "Task has been updated successfully.",
        })
      } else {
        const newTask = await apiClient.createTask(cleanedData)
        const mapped = { 
          ...newTask, 
          completed: newTask.done,
          dueDate: data.dueDate || undefined // Frontend da dueDate ni saqlab qolish
        }
        setTasks([mapped, ...tasks])
        toast({
          title: "Task Created",
          description: "Your new task has been created successfully.",
        })
      }

      setIsDialogOpen(false)
      setEditingTask(null)
      form.reset()
    } catch (error) {
      console.error("❌ Failed to save task:", error)
      toast({
        title: "Error",
        description: "Failed to save task.",
        variant: "destructive",
      })
    }
  }

  const handleToggleTask = async (taskId: string) => {
    try {
      const updated = await apiClient.toggleTask(taskId)
      const mapped = { ...updated, completed: updated.done }
      setTasks(tasks.map((t) => (t.id === taskId ? mapped : t)))
      toast({
        title: mapped.completed ? "Task Completed" : "Task Reopened",
        description: mapped.completed
          ? "Great job! Keep it up!"
          : "Task marked as pending.",
      })
    } catch (error) {
      console.error("Failed to toggle task:", error)
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiClient.deleteTask(taskId)
      setTasks(tasks.filter((task) => task.id !== taskId))
      toast({
        title: "Task Deleted",
        description: "Task has been deleted successfully.",
      })
    } catch (error) {
      console.error("Failed to delete task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      })
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    form.reset({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
    })
    setIsDialogOpen(true)
  }

  const handleNewTask = () => {
    setEditingTask(null)
    form.reset()
    setIsDialogOpen(true)
  }

  const filteredTasks = tasks.filter((task) => {
    const statusMatch =
      filter === "all" || (filter === "completed" ? task.completed : !task.completed)
    const priorityMatch =
      priorityFilter === "all" || task.priority === priorityFilter
    return statusMatch && priorityMatch
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500"
      case "MEDIUM":
        return "bg-yellow-500"
      case "LOW":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "destructive"
      case "MEDIUM":
        return "default"
      case "LOW":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded-lg"></div>
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tasks</h1>
              <p className="text-muted-foreground">Manage your tasks and stay organized</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewTask} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingTask ? "Edit Task" : "Create New Task"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter task title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter task description (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Priority */}
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="LOW">Low</SelectItem>
                              <SelectItem value="MEDIUM">Medium</SelectItem>
                              <SelectItem value="HIGH">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Due Date */}
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Buttons */}
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false)
                          setEditingTask(null)
                          form.reset()
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">{editingTask ? "Update" : "Create"}</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
              <TabsList>
                <TabsTrigger value="all">All Tasks</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as any)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <Card key={task.id} className={`transition-all ${task.completed ? "opacity-75" : ""}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 p-0 h-auto"
                        onClick={() => handleToggleTask(task.id)}
                      >
                        {task.completed ? (
                          <CheckSquare className="w-5 h-5 text-green-600" />
                        ) : (
                          <Square className="w-5 h-5 text-muted-foreground" />
                        )}
                      </Button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3
                              className={`text-lg font-semibold ${
                                task.completed ? "line-through text-muted-foreground" : ""
                              }`}
                            >
                              {task.title}
                            </h3>
                            {task.description && (
                              <p
                                className={`text-sm mt-1 ${
                                  task.completed ? "line-through text-muted-foreground" : "text-muted-foreground"
                                }`}
                              >
                                {task.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <Badge variant={getPriorityBadgeVariant(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mt-3">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                          {task.dueDate && (
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>Due: {formatDate(new Date(task.dueDate))}</span>
                              {new Date(task.dueDate) < new Date() && !task.completed && (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Created: {formatDate(new Date(task.createdAt))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                  <p className="text-muted-foreground mb-4">
                    {filter === "all"
                      ? "You haven't created any tasks yet."
                      : `No ${filter} tasks match your current filters.`}
                  </p>
                  <Button onClick={handleNewTask}>Create Your First Task</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}