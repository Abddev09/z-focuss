"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Timer, LayoutDashboard, CheckSquare, Settings, Palette, User, LogOut, Menu, X, User2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTimer } from "@/contexts/timer-context"
import { formatTime, cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pomodoro", href: "/pomodoro", icon: Timer },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Media", href: "/media", icon: Palette },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { timerState } = useTimer()

  if (!user) return null

  const safeName = user.username || user.name || "User" // username ni birinchi tekshiramiz
  const safeEmail = user.email || "no-email@example.com"

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Z-Focus
            </span>
          </Link>

          {/* Timer Status */}
          {timerState.isRunning && (
            <div className="hidden md:flex items-center space-x-2">
              <Badge variant={timerState.mode === "work" ? "default" : "secondary"} className="animate-pulse">
                {timerState.mode === "work" ? "Working" : "Break"}
              </Badge>
              <span className="text-sm font-mono">{formatTime(timerState.timeLeft)}</span>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn("flex items-center space-x-2", isActive && "bg-primary text-primary-foreground")}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-10 w-10">
                    {/* user.avatar dan foydalanamiz, chunki types.ts da shu nomda */}
                    <AvatarImage
                      src={user.avatar || "/placeholder.svg?height=100&width=100&query=user avatar"}
                      alt={safeName}
                    />
                    <AvatarFallback className="bg-muted flex items-center justify-center">
                      <User2 className="h-8 w-8 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{safeName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{safeEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn("w-full justify-start", isActive && "bg-primary text-primary-foreground")}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </div>
            {/* Mobile Timer Status */}
            {timerState.isRunning && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Badge variant={timerState.mode === "work" ? "default" : "secondary"}>
                    {timerState.mode === "work" ? "Working" : "Break"}
                  </Badge>
                  <span className="text-sm font-mono">{formatTime(timerState.timeLeft)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
