"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, LogOut, Settings, Shield, Eye } from "lucide-react"
import { AuthModal } from "./auth-modal"

interface UserMenuProps {
  onNavigate?: (tab: string) => void
}

export function UserMenu({ onNavigate }: UserMenuProps) {
  const { user, logout, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  if (!user) {
    return (
      <>
        <Button
          variant="outline"
          onClick={() => setShowAuthModal(true)}
          disabled={loading}
        >
          <User className="h-4 w-4 mr-2" />
          Đăng nhập
        </Button>
        
        <AuthModal 
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          defaultTab="login"
        />
      </>
    )
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-3 w-3" />
      case 'viewer': return <Eye className="h-3 w-3" />
      default: return <User className="h-3 w-3" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'viewer': return 'secondary'
      default: return 'default'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản trị'
      case 'viewer': return 'Xem'
      default: return 'Người dùng'
    }
  }

  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ')
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase()
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar_url} alt={user.full_name} />
            <AvatarFallback className="bg-primary/10">
              {getInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url} alt={user.full_name} />
                <AvatarFallback className="bg-primary/10 text-xs">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.full_name}</p>
                <p className="text-xs leading-none text-muted-foreground">@{user.username}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant={getRoleColor(user.role) as any} className="text-xs">
                {getRoleIcon(user.role)}
                <span className="ml-1">{getRoleText(user.role)}</span>
              </Badge>
              
              {user.email_verified && (
                <Badge variant="outline" className="text-xs text-green-600">
                  ✓ Đã xác thực
                </Badge>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground truncate" title={user.email}>{user.email}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onNavigate?.('settings')}>
          <User className="mr-2 h-4 w-4" />
          <span>Hồ sơ cá nhân</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onNavigate?.('settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Cài đặt</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} disabled={loading}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Simple logged-in indicator component
export function UserIndicator() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span>Đang tải...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 bg-red-400 rounded-full"></div>
        <span>Chưa đăng nhập</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="h-2 w-2 bg-green-400 rounded-full"></div>
      <span className="font-medium">{user.full_name}</span>
      <Badge variant="outline" className="text-xs">
        {getRoleText(user.role)}
      </Badge>
    </div>
  )
}

// Helper function for role text
function getRoleText(role: string) {
  switch (role) {
    case 'admin': return 'Admin'
    case 'viewer': return 'Viewer'
    default: return 'User'
  }
}