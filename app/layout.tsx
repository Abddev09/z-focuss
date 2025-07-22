import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { TimerProvider } from "@/contexts/timer-context"
import { MediaProvider } from "@/contexts/media-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Z-Focus - Productivity & Pomodoro Timer",
  description: "Boost your productivity with Z-Focus - the ultimate Pomodoro timer and task management app.",
  keywords: ["pomodoro", "productivity", "timer", "task management", "focus"],
  authors: [{ name: "Z-Focus Team" }],
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon-32x32.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark"  disableTransitionOnChange>
          <AuthProvider>
            <TimerProvider>
              <MediaProvider>
                {children}
                <Toaster />
              </MediaProvider>
            </TimerProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
