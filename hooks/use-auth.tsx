"use client"

import { useState, useEffect, useCallback, createContext, useContext } from "react"
import { User, LoginCredentials, CreateUserInput } from "@/types/auth"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (userData: CreateUserInput) => Promise<boolean>
  logout: () => Promise<void>
  clearCookie: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Verify authentication on app load
  const verifyAuth = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get token from localStorage if available
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('auth_token')
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include', // Still include cookies as fallback
        headers
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
        // Clear invalid token
        if (token) {
          localStorage.removeItem('auth_token')
        }
      }
    } catch (err) {
      console.error('Auth verification error:', err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    verifyAuth()
  }, [verifyAuth])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      // Clear any existing localStorage data before login
      clearAllLocalStorage()
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setUser(data.user)
        // Store token in localStorage
        if (data.token) {
          localStorage.setItem('auth_token', data.token)
        }
        
        // Force a full page refresh to ensure all components reload with new user data
        setTimeout(() => {
          window.location.reload()
        }, 100)
        
        return true
      } else {
        setError(data.error || 'Login failed')
        return false
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Network error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: CreateUserInput): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Auto-login after successful registration
        return await login({
          username: userData.username,
          password: userData.password,
          remember_me: false
        })
      } else {
        setError(data.error || 'Registration failed')
        return false
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError('Network error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Helper function to clear all user-related localStorage data
  const clearAllLocalStorage = () => {
    // Clear auth token
    localStorage.removeItem('auth_token')
    
    // Clear cached data that belongs to specific users
    localStorage.removeItem('projects')
    localStorage.removeItem('accounts')
    localStorage.removeItem('tasks')
    localStorage.removeItem('emailTemplates')
    localStorage.removeItem('codeComponents')
    localStorage.removeItem('emailNotificationSettings')
    
    // Clear any other user-specific settings
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('user_') || key.includes('cache_') || key.includes('settings_'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  const logout = async (): Promise<void> => {
    try {
      setLoading(true)
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      setUser(null)
      // Clear all localStorage data for this user
      clearAllLocalStorage()
      
      // Force page refresh to ensure complete state reset
      window.location.reload()
    } catch (err) {
      console.error('Logout error:', err)
      // Clear user state and localStorage even if logout request fails
      setUser(null)
      clearAllLocalStorage()
      window.location.reload()
    } finally {
      setLoading(false)
    }
  }

  const clearCookie = async (): Promise<void> => {
    try {
      setLoading(true)
      
      await fetch('/api/auth/clear-cookie', {
        method: 'GET',
        credentials: 'include'
      })
      
      setUser(null)
      clearAllLocalStorage()
      
      // Force page reload to ensure all state is cleared
      window.location.reload()
    } catch (err) {
      console.error('Clear cookie error:', err)
      setUser(null)
      clearAllLocalStorage()
      window.location.reload()
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearCookie,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Utility hook for checking if user is authenticated
export function useIsAuthenticated() {
  const { user, loading } = useAuth()
  return { 
    isAuthenticated: !!user, 
    isLoading: loading,
    user
  }
}

// Utility hook for protecting routes
export function useRequireAuth() {
  const { user, loading } = useAuth()
  const isAuthenticated = !!user
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to login page or show login modal
      // This can be customized based on your routing setup
      console.warn('User not authenticated, redirect required')
    }
  }, [loading, isAuthenticated])
  
  return { user, loading, isAuthenticated }
}