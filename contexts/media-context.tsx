"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Media } from "@/types"
import apiClient from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface MediaContextType {
  // Background state
  backgrounds: Media[]
  selectedBackground: string
  selectedBackgroundUrl: string

  // Sound state
  sounds: Media[]
  selectedSound: string
  selectedSoundUrl: string

  // Loading state
  loading: boolean

  // Actions
  selectBackground: (backgroundId: string, backgroundUrl: string) => void
  selectSound: (soundId: string, soundUrl: string) => void
  loadMedia: () => Promise<void>
  addBackground: (background: Media) => void
  addSound: (sound: Media) => void
}

const MediaContext = createContext<MediaContextType | undefined>(undefined)

// Default fallback media
const defaultBackgrounds: Media[] = [
  {
    id: "default-1",
    name: "Mountain Lake",
    url: "/placeholder.svg?height=300&width=400",
    type: "BACKGROUND" as const,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const defaultSounds: Media[] = [
  {
    id: "sound-1",
    name: "Rain",
    url: "/sounds/rain.mp3",
    type: "SOUND" as const,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
 
]

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [backgrounds, setBackgrounds] = useState<Media[]>([])
  const [sounds, setSounds] = useState<Media[]>([])
  const [selectedBackground, setSelectedBackground] = useState<string>("")
  const [selectedBackgroundUrl, setSelectedBackgroundUrl] = useState<string>("")
  const [selectedSound, setSelectedSound] = useState<string>("")
  const [selectedSoundUrl, setSelectedSoundUrl] = useState<string>("")
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()

  // Apply background to document body
  const applyBackground = (backgroundUrl: string) => {
    if (typeof document !== "undefined") {
      document.body.style.backgroundImage = `url(${backgroundUrl})`
      document.body.style.backgroundSize = "cover"
      document.body.style.backgroundPosition = "center"
      document.body.style.backgroundAttachment = "fixed"
      document.body.style.backgroundRepeat = "no-repeat"
    }
  }

  // Load media from API
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

  // Load user preferences from localStorage
  const loadUserPreferences = () => {
    if (typeof window === "undefined") return

    // Get all available media (including defaults as fallback)
    const allBackgrounds = backgrounds.length > 0 ? backgrounds : defaultBackgrounds
    const allSounds = sounds.length > 0 ? sounds : defaultSounds

    // Load saved preferences
    const savedBackground = localStorage.getItem("selectedBackground")
    const savedBackgroundUrl = localStorage.getItem("selectedBackgroundUrl")
    const savedSound = localStorage.getItem("selectedSound")
    const savedSoundUrl = localStorage.getItem("selectedSoundUrl")

    // Apply background if saved and exists
    if (savedBackground && savedBackgroundUrl) {
      const backgroundExists = allBackgrounds.find((bg) => bg.id === savedBackground)
      if (backgroundExists) {
        setSelectedBackground(savedBackground)
        setSelectedBackgroundUrl(savedBackgroundUrl)
        applyBackground(savedBackgroundUrl)
      } else {
        // Fallback to first default background
        const fallbackBg = allBackgrounds[0]
        if (fallbackBg) {
          setSelectedBackground(fallbackBg.id)
          setSelectedBackgroundUrl(fallbackBg.url)
          applyBackground(fallbackBg.url)
          localStorage.setItem("selectedBackground", fallbackBg.id)
          localStorage.setItem("selectedBackgroundUrl", fallbackBg.url)
        }
      }
    } else if (allBackgrounds.length > 0) {
      // No saved preference, use first available background
      const defaultBg = allBackgrounds[0]
      setSelectedBackground(defaultBg.id)
      setSelectedBackgroundUrl(defaultBg.url)
      applyBackground(defaultBg.url)
      localStorage.setItem("selectedBackground", defaultBg.id)
      localStorage.setItem("selectedBackgroundUrl", defaultBg.url)
    }

    // Apply sound if saved and exists
    if (savedSound && savedSoundUrl) {
      const soundExists = allSounds.find((sound) => sound.id === savedSound)
      if (soundExists) {
        setSelectedSound(savedSound)
        setSelectedSoundUrl(savedSoundUrl)
      } else {
        // Clear invalid sound preference
        localStorage.removeItem("selectedSound")
        localStorage.removeItem("selectedSoundUrl")
      }
    }
  }

  // Select background function
  const selectBackground = (backgroundId: string, backgroundUrl: string) => {
    setSelectedBackground(backgroundId)
    setSelectedBackgroundUrl(backgroundUrl)
    localStorage.setItem("selectedBackground", backgroundId)
    localStorage.setItem("selectedBackgroundUrl", backgroundUrl)
    applyBackground(backgroundUrl)

    toast({
      title: "Background Updated",
      description: "Your workspace background has been changed.",
    })
  }

  // Select sound function
  const selectSound = (soundId: string, soundUrl: string) => {
    setSelectedSound(soundId)
    setSelectedSoundUrl(soundUrl)
    localStorage.setItem("selectedSound", soundId)
    localStorage.setItem("selectedSoundUrl", soundUrl)

    toast({
      title: "Sound Updated",
      description: "Your ambient sound has been changed.",
    })
  }

  // Add new background
  const addBackground = (background: Media) => {
    setBackgrounds((prev) => [...prev, background])
  }

  // Add new sound
  const addSound = (sound: Media) => {
    setSounds((prev) => [...prev, sound])
  }

  // Initialize on mount
  useEffect(() => {
    loadMedia()
  }, [])

  // Load preferences after media is loaded
  useEffect(() => {
    if (!loading) {
      loadUserPreferences()
    }
  }, [loading, backgrounds, sounds])

  const value: MediaContextType = {
    backgrounds: backgrounds.length > 0 ? backgrounds : defaultBackgrounds,
    selectedBackground,
    selectedBackgroundUrl,
    sounds: sounds.length > 0 ? sounds : defaultSounds,
    selectedSound,
    selectedSoundUrl,
    loading,
    selectBackground,
    selectSound,
    loadMedia,
    addBackground,
    addSound,
  }

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>
}

export function useMedia() {
  const context = useContext(MediaContext)
  if (context === undefined) {
    throw new Error("useMedia must be used within a MediaProvider")
  }
  return context
}
