import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Timer, CheckSquare, BarChart3, Palette, Volume2, Users } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle" // ThemeToggle ni import qilish

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"> 
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Z-Focus
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
            <ThemeToggle /> {/* Dark/Light mode tugmasini qo'shish */}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            🚀 Boost Your Productivity
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Focus Better with Z-Focus
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The ultimate Pomodoro timer and task management app. Stay focused, track your progress, and achieve your
            goals with beautiful backgrounds and ambient sounds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Focusing Now
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything You Need to Stay Focused</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Z-Focus combines the power of the Pomodoro Technique with modern task management and beautiful customization
            options.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Timer className="w-12 h-12 text-blue-600 mb-4" />
              <CardTitle>Pomodoro Timer</CardTitle>
              <CardDescription>Customizable work and break intervals with automatic session tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 25/5 minute default intervals</li>
                <li>• Customizable durations</li>
                <li>• Auto-start options</li>
                <li>• Session statistics</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CheckSquare className="w-12 h-12 text-green-600 mb-4" />
              <CardTitle>Task Management</CardTitle>
              <CardDescription>Organize your work with priority levels and due dates</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Create and organize tasks</li>
                <li>• Priority levels (Low, Medium, High)</li>
                <li>• Due date tracking</li>
                <li>• Task completion stats</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-purple-600 mb-4" />
              <CardTitle>Progress Analytics</CardTitle>
              <CardDescription>Track your productivity with detailed statistics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Daily/weekly/monthly stats</li>
                <li>• Focus time tracking</li>
                <li>• Productivity streaks</li>
                <li>• Visual charts and graphs</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Palette className="w-12 h-12 text-pink-600 mb-4" />
              <CardTitle>Beautiful Backgrounds</CardTitle>
              <CardDescription>Customize your workspace with stunning background images</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Curated background collection</li>
                <li>• Upload custom images</li>
                <li>• Dynamic themes</li>
                <li>• Distraction-free mode</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Volume2 className="w-12 h-12 text-orange-600 mb-4" />
              <CardTitle>Ambient Sounds</CardTitle>
              <CardDescription>Stay focused with relaxing background sounds and music</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Nature sounds library</li>
                <li>• White noise options</li>
                <li>• Custom audio uploads</li>
                <li>• Volume controls</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Users className="w-12 h-12 text-teal-600 mb-4" />
              <CardTitle>User Profiles</CardTitle>
              <CardDescription>Personalize your experience with custom profiles and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Custom avatars and bios</li>
                <li>• Theme preferences</li>
                <li>• Sound settings</li>
                <li>• Data synchronization</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Productivity?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of users who have already improved their focus and achieved their goals with Z-Focus.
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Your Journey Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Timer className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold">Z-Focus</span>
          </div>
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
        <div className="text-center mt-8 text-sm text-muted-foreground">© 2024 Z-Focus. All rights reserved.</div>
      </footer>
    </div>
  )
}
