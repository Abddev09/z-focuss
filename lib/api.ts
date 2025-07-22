import { Task } from "@/types"
import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from "axios"
import Cookies from "js-cookie"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000, // ⏱️ 60s timeout for large file uploads
      headers: {
        "Content-Type": "application/json",
      },
    })

    this.setupInterceptors()
  }

  // 🔐 Token Interceptors
  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.removeToken()
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login"
          }
        }
        return Promise.reject(error)
      },
    )
  }

  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token") || Cookies.get("token") || null
    }
    return null
  }

  private setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
      Cookies.set("token", token, { expires: 7 })
    }
  }

  private removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      Cookies.remove("token")
    }
  }

  private setUserId(userId: string): void {
    if (typeof window !== "undefined"){
      localStorage.setItem("userId", userId)
      Cookies.set("userId", userId)
    }
  }

  private getUserId(): string | null  {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userId") || Cookies.get("userId") || null
    }
    return null
  }

    private removeUserId(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userId")
      Cookies.remove("userId")
    }
  }

  // 🔐 Auth Methods
  async login(email: string, password: string) {
    const response = await this.client.post("/api/auth/login", { email, password })
    if (response.data.token) {
      this.setToken(response.data.token)
      this.setUserId(response.data.user.id)
    }
    return response.data
  }

  async register(userData: {
    username: string
    email: string
    password: string
  }) {
    const response = await this.client.post("/api/auth/register", userData)
    if (response.data.token) {
      this.setToken(response.data.token)
      this.setUserId(response.data.user.id)
    }
    return response.data
  }

  async logout() {
    this.removeToken()
    this.removeUserId()
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login"
    }
  }

  async getCurrentUser() {
    const response = await this.client.get("/api/auth/me")
    return response.data
  }

  // 👤 User Methods
  async getUserProfile() {
    const response = await this.client.get("/api/users/profile")
    return response.data
  }

  async updateUserProfile(data: any) {
    const response = await this.client.patch("/api/users/profile", data,{
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
    return response.data
  }

  async getUserStats() {
    const response = await this.client.get("/api/users/stats")
    return response.data
  }

  // ✅ Task Methods
  async getTasks(): Promise<Task[]> {
    const response = await this.client.get("/api/tasks")
    const data = response.data

    if (Array.isArray(data)) {
      return data
    }

    if (Array.isArray(data?.tasks)) {
      return data.tasks
    }

    return []
  }

  async createTask(task: {
    title: string
    description?: string
    priority?: "LOW" | "MEDIUM" | "HIGH"
    dueDate?: string
  }) {
    const response = await this.client.post("/api/tasks", task)
    return response.data
  }

  async updateTask(id: string, data: any) {
    const response = await this.client.patch(`/api/tasks/${id}`, data)
    return response.data
  }

  async toggleTask(id: string) {
    const response = await this.client.patch(`/api/tasks/${id}/toggle`)
    return response.data
  }

  async deleteTask(id: string) {
    const response = await this.client.delete(`/api/tasks/${id}`)
    return response.data
  }

  // 🍅 Pomodoro Methods
  async getPomodoroSessions() {
    const response = await this.client.get("/api/pomodoro")
    return response.data
  }

  async startPomodoroSession(data: {
    duration: number
    taskId?: string
  }) {
    const response = await this.client.post("/api/pomodoro", data)
    return response.data
  }

  async completePomodoroSession(id: string) {
    const response = await this.client.patch(`/api/pomodoro/${id}/complete`)
    return response.data
  }

  async getPomodoroStats() {
    const response = await this.client.get("/api/pomodoro/stats")
    return response.data
  }

  // 🎵 Media Methods
  async getMedia(type: "BACKGROUND" | "SOUND") {
    const userId = this.getUserId()
    const response = await this.client.get(`/api/media?type=${type}&userId=${userId}`)
    return response.data

  }

  async uploadMedia(file: File, type: "BACKGROUND" | "SOUND") {
    const formData = new FormData()
    formData.append("file", file)
    const userId = this.getUserId()
    const response = await this.client.post(`/api/media/upload?type=${type}&userId=${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  }
}

// 🚀 Export
export const apiClient = new ApiClient()
export default apiClient