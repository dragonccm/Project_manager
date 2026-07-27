"use client"

import { UserMenu } from "@/components/auth/user-menu"
import { Menu, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import { useTheme } from "@/hooks/use-theme"

interface HeaderProps {
  activeTab: string
  onMenuClick: () => void
  isMobile: boolean
  onNavigate: (tab: string) => void
}

export function Header({ activeTab, onMenuClick, isMobile, onNavigate }: HeaderProps) {
  const { t } = useLanguage()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 w-full bg-background transition-colors">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Left Side: Hamburger Menu + Google Developer Program Logo */}
        <div className="flex items-center gap-3 md:gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-foreground/80 hover:bg-muted/80 h-9 w-9" 
            onClick={onMenuClick}
            aria-label={t("toggleMenu")}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none" 
            onClick={() => onNavigate("dashboard")}
          >
            {/* Google Infinity 4-Color Logo */}
            <svg width="34" height="18" viewBox="0 0 36 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <path 
                d="M10 4C6.68629 4 4 6.68629 4 10C4 13.3137 6.68629 16 10 16C13.3137 16 16 13.3137 18 10C20 6.68629 22.6863 4 26 4C29.3137 4 32 6.68629 32 10C32 13.3137 29.3137 16 26 16C22.6863 16 20 13.3137 18 10" 
                stroke="url(#google_infinity_grad)" 
                strokeWidth="4" 
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="google_infinity_grad" x1="0" y1="0" x2="36" y2="20" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#4285F4" />
                  <stop offset="30%" stopColor="#EA4335" />
                  <stop offset="65%" stopColor="#FBBC04" />
                  <stop offset="100%" stopColor="#34A853" />
                </linearGradient>
              </defs>
            </svg>

            <span className="font-medium text-base tracking-tight text-foreground font-sans">
              Google Developer Program
            </span>
          </div>
        </div>

        {/* Right Side: Theme Toggle (◐ Circle) & User Profile Avatar */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Half dark / half light theme toggle icon ◐ */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-foreground/80 hover:bg-muted h-9 w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={t("toggleTheme")}
          >
            <div className="relative w-5 h-5 rounded-full border-2 border-current overflow-hidden flex">
              <div className="w-1/2 h-full bg-current" />
              <div className="w-1/2 h-full bg-transparent" />
            </div>
          </Button>

          <UserMenu onNavigate={onNavigate} />
        </div>
      </div>
    </header>
  )
}


