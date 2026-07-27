"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  LayoutGrid, 
  Sparkles, 
  Calendar, 
  Heart, 
  FolderGit2, 
  Users, 
  GraduationCap,
  Code,
  Mail,
  Settings,
  ShieldCheck
} from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useAuth } from "@/hooks/use-auth"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  className?: string
  isMobile?: boolean
  closeMobileMenu?: () => void
}

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  className,
  isMobile = false,
  closeMobileMenu
}: SidebarProps) {
  const { t } = useLanguage()
  const { user } = useAuth()

  // User không có field `name`/`avatar` — schema dùng `full_name`/`avatar_url`.
  // Bản cũ đọc sai tên field nên luôn rơi vào giá trị mặc định cứng.
  const displayName = user?.full_name || user?.username || ""

  const menuItems = [
    { id: "dashboard", label: "For you", icon: LayoutGrid },
    { id: "projects", label: "Discover", icon: Sparkles },
    { id: "tasksOverview", label: "Events", icon: Calendar },
    { id: "tasks", label: "Benefits", icon: Heart },
    { id: "a4designer", label: "Projects", icon: FolderGit2 },
    { id: "admin", label: "Communities", icon: Users },
    { id: "reports", label: "Learning", icon: GraduationCap },
    { id: "components", label: "Notes", icon: Code },
    { id: "email", label: "Email", icon: Mail },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const handleTabClick = (id: string) => {
    setActiveTab(id)
    if (isMobile && closeMobileMenu) {
      closeMobileMenu()
    }
  }

  return (
    <div className={cn(
      "relative flex flex-col h-full bg-background select-none w-60 py-2",
      className
    )}>
      {/* Navigation Links */}
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start rounded-full transition-all duration-150 text-sm font-medium h-10 px-4 gap-3",
                  isActive 
                    ? "google-dev-active-chip shadow-none" 
                    : "text-foreground/80 hover:text-foreground hover:bg-muted/60"
                )}
                onClick={() => handleTabClick(item.id)}
              >
                <item.icon className={cn(
                  "h-4.5 w-4.5 flex-shrink-0 transition-colors", 
                  isActive ? "text-[#001D35] dark:text-[#C2E7FF]" : "text-foreground/70"
                )} />
                
                <span className="truncate">
                  {item.label}
                </span>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom Profile Card matching screenshot */}
      <div className="p-3 mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setActiveTab("settings")}>
          <div className="w-8.5 h-8.5 rounded-full bg-[#4285F4] text-white font-bold flex items-center justify-center text-xs overflow-hidden flex-shrink-0">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={t("userAvatar")} className="w-full h-full object-cover" />
            ) : (
              <span>{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-foreground truncate">
              {displayName}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user?.email || ""}
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}



