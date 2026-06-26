"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = document.documentElement.classList.contains("dark")
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches
    setIsDark(stored || (prefersDark && !document.documentElement.classList.contains("light")))
  }, [])

  function toggle() {
    const root = document.documentElement
    const next = !isDark
    setIsDark(next)
    root.classList.toggle("dark", next)
    root.classList.toggle("light", !next)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun data-icon /> : <Moon data-icon />}
    </Button>
  )
}
