"use client"

import { UserMenu } from "@/components/auth/user-menu"
import { Bell, Menu, Search, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/hooks/use-language"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface HeaderProps {
  activeTab: string
  onMenuClick: () => void
  isMobile: boolean
  onNavigate: (tab: string) => void
}

export function Header({ activeTab, onMenuClick, isMobile, onNavigate }: HeaderProps) {
  const { t } = useLanguage()

  // Format active tab to breadcrumb title
  const getPageTitle = (tab: string) => {
    const item = [
      { id: "dashboard", label: t("dashboard") },
      { id: "projects", label: t("projects") },
      { id: "accounts", label: t("accounts") },
      { id: "tasks", label: t("dailyTasks") },
      { id: "tasksOverview", label: t("taskOverview") },
      { id: "reports", label: t("reports") },
      { id: "components", label: "Notes" },
      { id: "a4designer", label: "A4 Designer" },
      { id: "email", label: t("emailComposer") },
      { id: "admin", label: t("adminPanel") },
      { id: "emailSettings", label: t("emailSettings") },
      { id: "settings", label: t("settings") },
    ].find(i => i.id === tab)
    
    return item ? item.label : "Dashboard"
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl shadow-soft supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6">
        {/* Mobile Menu Button */}
        {isMobile && (
          <Button variant="ghost" size="icon" className="mr-4 md:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Breadcrumbs / Title */}
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mr-4">
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="hover:text-primary transition-colors">Dragonccm</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-primary">{getPageTitle(activeTab)}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <span className="md:hidden font-display font-semibold text-lg">{getPageTitle(activeTab)}</span>
        </div>

        {/* Right Side Accessories */}
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-64 pl-9 rounded-full bg-muted/50 border-transparent focus:bg-background focus:border-primary/50 transition-all"
            />
            <div className="absolute right-2 top-2 hidden lg:flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive animate-pulse" />
          </Button>
          
          <div className="h-8 w-[1px] bg-border/50 mx-2 hidden md:block" />
          
          <UserMenu onNavigate={onNavigate} />
        </div>
      </div>
    </header>
  )
}
