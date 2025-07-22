"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Play, Pause, Volume2, VolumeX, ImageIcon, Music, Plus, Check } from "lucide-react"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { Navbar } from "@/components/layout/navbar"
import type { Media } from "@/types"
import apiClient from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function MediaPage() {
  const [backgrounds, setBackgrounds] = useState<Media[]>([])
  const [sounds, setSounds] = useState<Media[]>([])
  const [selectedBackground, setSelectedBackground] = useState<string>("")
  const [selectedSound, setSelectedSound] = useState<string>("")
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadType, setUploadType] = useState<"BACKGROUND" | "SOUND">("BACKGROUND")

  const { toast } = useToast()

  useEffect(() => {
    loadMedia()
    loadUserPreferences()
  }, [])

  const loadMedia = async () => {
    try {
      const [backgroundsData, soundsData] = await Promise.all([
        apiClient.getMedia("BACKGROUND"),
        apiClient.getMedia("SOUND"),
      ])

      setBackgrounds(backgroundsData)
      setSounds(soundsData)
    } catch (error) {
      console.error("Failed to load media:", error)
      toast({
        title: "Error",
        description: "Failed to load media files.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadUserPreferences = () => {
    // Load from localStorage or user preferences
    const savedBackground = localStorage.getItem("selectedBackground")
    const savedSound = localStorage.getItem("selectedSound")

    if (savedBackground) setSelectedBackground(savedBackground)
    if (savedSound) setSelectedSound(savedSound)
  }

  const handleBackgroundSelect = (backgroundId: string, backgroundUrl: string) => {
    setSelectedBackground(backgroundId)
    localStorage.setItem("selectedBackground", backgroundId)
    localStorage.setItem("selectedBackgroundUrl", backgroundUrl)

    // Apply background to body
    document.body.style.backgroundImage = `url(${backgroundUrl})`
    document.body.style.backgroundSize = "cover"
    document.body.style.backgroundPosition = "center"
    document.body.style.backgroundAttachment = "fixed"

    toast({
      title: "Background Updated",
      description: "Your workspace background has been changed.",
    })
  }

  const handleSoundSelect = (soundId: string, soundUrl: string) => {
    setSelectedSound(soundId)
    localStorage.setItem("selectedSound", soundId)
    localStorage.setItem("selectedSoundUrl", soundUrl)

    toast({
      title: "Sound Updated",
      description: "Your ambient sound has been changed.",
    })
  }

  const handlePlaySound = (soundUrl: string) => {
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
      setIsPlaying(false)
    }

    if (!isPlaying) {
      const audio = new Audio(soundUrl)
      audio.loop = true
      audio.volume = 0.3
      audio.play()
      setCurrentAudio(audio)
      setIsPlaying(true)

      audio.onended = () => {
        setIsPlaying(false)
        setCurrentAudio(null)
      }
    }
  }

  const handleStopSound = () => {
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
      setIsPlaying(false)
    }
  }

  const handleFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const file = formData.get("file") as File

    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload.",
        variant: "destructive",
      })
      return
    }

    try {
      const uploadedMedia = await apiClient.uploadMedia(file, uploadType)

      if (uploadType === "BACKGROUND") {
        setBackgrounds([...backgrounds, uploadedMedia])
      } else {
        setSounds([...sounds, uploadedMedia])
      }

      setUploadDialogOpen(false)
      toast({
        title: "Upload Successful",
        description: `Your ${uploadType.toLowerCase()} has been uploaded successfully.`,
      })
    } catch (error) {
      console.error("Failed to upload media:", error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload your file. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Default backgrounds and sounds (fallback)
  const defaultBackgrounds = [
    {
      id: "default-1",
      name: "Mountain Lake",
      url: "/placeholder.svg?height=300&width=400",
      type: "BACKGROUND" as const,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "default-2",
      name: "Forest Path",
      url: "/placeholder.svg?height=300&width=400",
      type: "BACKGROUND" as const,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "default-3",
      name: "Ocean Waves",
      url: "/placeholder.svg?height=300&width=400",
      type: "BACKGROUND" as const,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  const defaultSounds = [
    {
      id: "sound-1",
      name: "Rain",
      url: "/sounds/rain.mp3",
      type: "SOUND" as const,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sound-2",
      name: "Forest",
      url: "/sounds/forest.mp3",
      type: "SOUND" as const,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "sound-3",
      name: "Ocean",
      url: "/sounds/ocean.mp3",
      type: "SOUND" as const,
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  const allBackgrounds = backgrounds.length > 0 ? backgrounds : defaultBackgrounds
  const allSounds = sounds.length > 0 ? sounds : defaultSounds

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-muted rounded-lg"></div>
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
              <h1 className="text-3xl font-bold mb-2">Media Library</h1>
              <p className="text-muted-foreground">Customize your workspace with backgrounds and ambient sounds</p>
            </div>

            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Upload Media</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Media</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="type">Media Type</Label>
                    <select
                      id="type"
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value as "BACKGROUND" | "SOUND")}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      <option value="BACKGROUND">Background Image</option>
                      <option value="SOUND">Ambient Sound</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="file">File</Label>
                    <Input
                      id="file"
                      name="file"
                      type="file"
                      accept={uploadType === "BACKGROUND" ? "image/*" : "audio/*"}
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {uploadType === "BACKGROUND"
                        ? "Supported formats: JPG, PNG, WebP (max 5MB)"
                        : "Supported formats: MP3, WAV, OGG (max 10MB)"}
                    </p>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="backgrounds" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="backgrounds" className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>Backgrounds</span>
              </TabsTrigger>
              <TabsTrigger value="sounds" className="flex items-center space-x-2">
                <Music className="w-4 h-4" />
                <span>Sounds</span>
              </TabsTrigger>
            </TabsList>

            {/* Backgrounds Tab */}
            <TabsContent value="backgrounds">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {allBackgrounds.map((background) => (
                  <Card
                    key={background.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedBackground === background.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handleBackgroundSelect(background.id, background.url)}
                  >
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={background.url || "/placeholder.svg"}
                          alt={background.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        {selectedBackground === background.id && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                        {background.isDefault && (
                          <Badge variant="secondary" className="absolute top-2 left-2">
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold">{background.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {background.isDefault ? "Built-in background" : "Custom upload"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Sounds Tab */}
            <TabsContent value="sounds">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {allSounds.map((sound) => (
                  <Card
                    key={sound.id}
                    className={`transition-all hover:shadow-lg ${
                      selectedSound === sound.id ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Volume2 className="w-5 h-5" />
                          <span>{sound.name}</span>
                        </div>
                        {selectedSound === sound.id && <Check className="w-5 h-5 text-primary" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {sound.isDefault ? "Built-in sound" : "Custom upload"}
                          </p>
                          {sound.isDefault && <Badge variant="secondary">Default</Badge>}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePlaySound(sound.url)}
                            disabled={isPlaying}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          {isPlaying && (
                            <Button variant="outline" size="sm" onClick={handleStopSound}>
                              <Pause className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant={selectedSound === sound.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSoundSelect(sound.id, sound.url)}
                          >
                            Select
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Sound Controls */}
              {isPlaying && (
                <Card className="mt-6">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Volume2 className="w-5 h-5" />
                        <span>Playing ambient sound</span>
                      </div>
                      <Button variant="outline" onClick={handleStopSound}>
                        <VolumeX className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
