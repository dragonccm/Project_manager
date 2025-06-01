"use client"

import { useTheme as useNextTheme } from "next-themes"
import { useEffect, useState } from "react"

export function useTheme() {
  const { theme, setTheme: setNextTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return {
      theme: "light" as const,
      setTheme: () => {},
    }
  }

  return {
    theme: theme as "light" | "dark" | "system" | undefined,
    setTheme: setNextTheme,
  }
}
