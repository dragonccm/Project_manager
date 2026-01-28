"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  BarChart3, 
  FolderOpen, 
  Users, 
  CheckSquare, 
  PieChart, 
  FileText, 
  Code, 
  Layout, 
  Mail, 
  Shield, 
  Cog, 
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/hooks/use-language"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"

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
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { id: "dashboard", label: t("dashboard"), icon: BarChart3 },
    { id: "projects", label: t("projects"), icon: FolderOpen },
    { id: "accounts", label: t("accounts"), icon: Users },
    { id: "tasks", label: t("dailyTasks"), icon: CheckSquare },
    { id: "tasksOverview", label: t("taskOverview"), icon: PieChart },
    { id: "reports", label: t("reports"), icon: FileText },
    { id: "components", label: "Notes", icon: Code },
    { id: "a4designer", label: "A4 Designer", icon: Layout },
    { id: "email", label: t("emailComposer"), icon: Mail },
    { id: "admin", label: t("adminPanel"), icon: Shield },
    { id: "emailSettings", label: t("emailSettings"), icon: Cog },
    { id: "settings", label: t("settings"), icon: Settings },
  ]

  const handleTabClick = (id: string) => {
    setActiveTab(id)
    if (isMobile && closeMobileMenu) {
      closeMobileMenu()
    }
  }

  return (
    <div className={cn(
      "relative flex flex-col h-full bg-background/80 backdrop-blur-xl border-r border-border transition-all duration-300",
      collapsed && !isMobile ? "w-20" : "w-72",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        {!collapsed && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-primary">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-gradient">
              Dragonccm
            </span>
          </div>
        )}
        {collapsed && (
           <div className="mx-auto h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-primary">
             <span className="text-white font-bold text-xl">D</span>
           </div>
        )}
        
        {!isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden md:flex bg-muted/50 hover:bg-muted text-muted-foreground w-6 h-6 rounded-full absolute -right-3 top-8 border shadow-sm z-50"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start relative group overflow-hidden transition-all duration-300",
                activeTab === item.id 
                  ? "bg-primary/10 text-primary hover:bg-primary/20 shadow-glow-primary border border-primary/20" 
                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                collapsed && !isMobile ? "px-2 justify-center" : "px-4"
              )}
              onClick={() => handleTabClick(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-all duration-300", 
                activeTab === item.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                collapsed && !isMobile ? "mr-0" : "mr-3"
              )} />
              
              {!collapsed && (
                <span className="font-medium truncate animate-fade-in">
                  {item.label}
                </span>
              )}
              
              {activeTab === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
              )}
            </Button>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border/50 bg-muted/20">
        <div className={cn("flex items-center gap-2", collapsed && !isMobile ? "flex-col" : "justify-between")}>
           <ThemeToggle />
           <LanguageToggle />
        </div>
      </div>
    </div>
  )
}
