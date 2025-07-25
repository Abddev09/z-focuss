"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import { User, Timer, Palette, Bell, Save } from "lucide-react"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { profileSchema, type ProfileFormData } from "@/schemas/auth"
import { useAuth } from "@/contexts/auth-context"
import { useTimer } from "@/contexts/timer-context"
import apiClient from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/utils"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const { user, updateUser } = useAuth()
  const { settings, updateSettings } = useTimer()
  const { toast } = useToast()
  const { setTheme } = useTheme()

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || "",
      bio: user?.bio || "",
      theme: user?.theme ,
      soundEnabled: user?.soundEnabled ?? true,
    },
  })

  useEffect(() => {
    if (user) {
      profileForm.reset({
        username: user.username,
        bio: user.bio || "",
        theme: user.theme,
        soundEnabled: user.soundEnabled,
      })
      setAvatarPreview(user.avatar || "")
    }
  }, [user, profileForm])

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const onProfileSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    try {
      let updatedUser
      const formData = new FormData()

      // Append all form data fields to FormData
      formData.append("username", data.username)
      formData.append("bio", data.bio || "") // Ensure bio is not undefined
      formData.append("theme", data.theme)
      formData.append("soundEnabled", String(data.soundEnabled)) // Convert boolean to string for FormData

      // Append avatar file if it exists, using "file" as the key
      if (avatarFile) {
        formData.append("file", avatarFile) // <--- Changed from "avatar" to "file"
      }

      // Send FormData to the backend
      // Assuming apiClient.updateUserProfile can handle FormData
      const response = await apiClient.updateUserProfile(formData)
      updatedUser = response.user // Assuming the backend returns { message, user }

      updateUser(updatedUser) // Update the user context with the new data

      // Apply theme and save to localStorage ONLY after successful API update
      if (user?.theme !== updatedUser.theme) {
        setTheme(updatedUser.theme)
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })

    } catch (error) {
      console.error("Failed to update profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTimerSettingsChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value })
    toast({
      title: "Settings Updated",
      description: "Timer settings have been updated.",
    })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Settings</h1>
              <p className="text-muted-foreground">Manage your account and application preferences</p>
            </div>
            {/* Form component wraps the entire Tabs */}
            <Form {...profileForm}>
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile" className="flex items-center justify-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </TabsTrigger>
                  <TabsTrigger value="timer" className="flex items-center justify-center space-x-2">
                    <Timer className="w-4 h-4" />
                    <span className="hidden sm:inline">Timer</span>
                  </TabsTrigger>
                  <TabsTrigger value="appearance" className="flex items-center justify-center space-x-2">
                    <Palette className="w-4 h-4" />
                    <span className="hidden sm:inline">Appearance</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center justify-center space-x-2">
                    <Bell className="w-4 h-4" />
                    <span className="hidden sm:inline">Notifications</span>
                  </TabsTrigger>
                </TabsList>

                {/* Profile Settings */}
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="w-5 h-5" />
                        <span>Profile Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* The actual HTML form element for submission */}
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        {/* Avatar */}
                        <div className="flex items-center space-x-6">
                          <Avatar className="w-20 h-20">
                            <AvatarImage src={avatarPreview || "/placeholder.svg"} alt={user?.username} />
                            <AvatarFallback className="text-lg">
                              {user?.username ? getInitials(user.username) : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("avatar-upload")?.click()}
                            >
                              Change Avatar
                            </Button>
                            <input
                              id="avatar-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarChange}
                            />
                            <p className="text-sm text-muted-foreground mt-2">JPG, PNG or GIF (max. 2MB)</p>
                          </div>
                        </div>
                        <FormField
                          control={profileForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Tell us about yourself" {...field} />
                              </FormControl>
                              <FormDescription>Brief description for your profile (optional)</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end">
                          <Button type="submit" disabled={loading}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Timer Settings */}
                <TabsContent value="timer">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Timer className="w-5 h-5" />
                          <span>Pomodoro Timer</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Work Duration: {Math.floor(settings.workDuration / 60)} minutes
                            </label>
                            <Slider
                              value={[settings.workDuration / 60]}
                              onValueChange={([value]) => handleTimerSettingsChange("workDuration", value * 60)}
                              max={60}
                              min={5}
                              step={5}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Short Break: {Math.floor(settings.shortBreakDuration / 60)} minutes
                            </label>
                            <Slider
                              value={[settings.shortBreakDuration / 60]}
                              onValueChange={([value]) => handleTimerSettingsChange("shortBreakDuration", value * 60)}
                              max={30}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Long Break: {Math.floor(settings.longBreakDuration / 60)} minutes
                            </label>
                            <Slider
                              value={[settings.longBreakDuration / 60]}
                              onValueChange={([value]) => handleTimerSettingsChange("longBreakDuration", value * 60)}
                              max={60}
                              min={5}
                              step={5}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">
                              Sessions until Long Break: {settings.sessionsUntilLongBreak}
                            </label>
                            <Slider
                              value={[settings.sessionsUntilLongBreak]}
                              onValueChange={([value]) => handleTimerSettingsChange("sessionsUntilLongBreak", value)}
                              max={10}
                              min={2}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div className="space-y-4 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium">Auto-start Breaks</label>
                              <p className="text-sm text-muted-foreground">Automatically start break timers</p>
                            </div>
                            <Switch
                              checked={settings.autoStartBreaks}
                              onCheckedChange={(checked) => handleTimerSettingsChange("autoStartBreaks", checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium">Auto-start Pomodoros</label>
                              <p className="text-sm text-muted-foreground">
                                Automatically start work sessions after breaks
                              </p>
                            </div>
                            <Switch
                              checked={settings.autoStartPomodoros}
                              onCheckedChange={(checked) => handleTimerSettingsChange("autoStartPomodoros", checked)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Appearance Settings */}
                <TabsContent value="appearance">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Palette className="w-5 h-5" />
                        <span>Appearance</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Theme</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value) // Update form state
                                // The actual setTheme call will happen after successful form submission
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="light">Light</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>Choose your preferred color theme</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="soundEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Sound Effects</FormLabel>
                              <FormDescription>Play sounds for timer notifications</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end">
                        <Button type="button" onClick={profileForm.handleSubmit(onProfileSubmit)} disabled={loading}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notifications Settings */}
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Bell className="w-5 h-5" />
                        <span>Notifications</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium">Browser Notifications</label>
                          <p className="text-sm text-muted-foreground">Show notifications when timer completes</p>
                        </div>
                        <Switch
                          checked={settings.notificationsEnabled}
                          onCheckedChange={(checked) => handleTimerSettingsChange("notificationsEnabled", checked)}
                        />
                      </div>
                      {/* This Field is redundant with the one in Appearance tab, consider removing one */}
                      <FormField
                        control={profileForm.control}
                        name="soundEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Sound Notifications</FormLabel>
                              <FormDescription>Play sound when timer completes</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Note:</strong> Browser notifications require permission. Click the notification icon
                          in your browser's address bar to enable them.
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <Button type="button" onClick={profileForm.handleSubmit(onProfileSubmit)} disabled={loading}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </Form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
