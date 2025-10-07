'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/hooks/use-language'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  KeyRound,
  Lock,
  Check,
  AlertCircle,
  Loader2,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react'

interface ChangePasswordFormProps {
  userEmail: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ChangePasswordForm({ userEmail, onSuccess, onCancel }: ChangePasswordFormProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Calculate password strength
  useEffect(() => {
    let strength = 0
    if (newPassword.length >= 8) strength += 25
    if (/[A-Z]/.test(newPassword)) strength += 25
    if (/[a-z]/.test(newPassword)) strength += 25
    if (/[0-9]/.test(newPassword)) strength += 25
    
    setPasswordStrength(strength)
  }, [newPassword])
  
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-red-500'
    if (passwordStrength < 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }
  
  const getPasswordStrengthText = () => {
    if (passwordStrength < 50) return t('weak')
    if (passwordStrength < 75) return t('medium')
    return t('strong')
  }
  
  const validateForm = () => {
    if (!currentPassword) {
      toast({
        title: t('error'),
        description: t('enterCurrentPassword'),
        variant: 'destructive',
      })
      return false
    }
    
    if (!newPassword) {
      toast({
        title: t('error'),
        description: t('enterNewPassword'),
        variant: 'destructive',
      })
      return false
    }
    
    if (newPassword.length < 8) {
      toast({
        title: t('error'),
        description: t('passwordTooShort'),
        variant: 'destructive',
      })
      return false
    }
    
    if (passwordStrength < 75) {
      toast({
        title: t('error'),
        description: t('passwordTooWeak'),
        variant: 'destructive',
      })
      return false
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: t('error'),
        description: t('passwordMismatch'),
        variant: 'destructive',
      })
      return false
    }
    
    if (currentPassword === newPassword) {
      toast({
        title: t('error'),
        description: t('newPasswordMustBeDifferent'),
        variant: 'destructive',
      })
      return false
    }
    
    return true
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          currentPassword,
          newPassword,
          confirmNewPassword: confirmPassword,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: t('error'),
            description: t('invalidCurrentPassword'),
            variant: 'destructive',
          })
          return
        }
        
        throw new Error(data.error || 'Failed to change password')
      }
      
      toast({
        title: t('success'),
        description: t('passwordChanged'),
      })
      
      // Clear form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error changing password:', error)
      toast({
        title: t('error'),
        description: error.message || t('failedToChangePassword'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }
  
  const renderPasswordInput = (
    id: string,
    label: string,
    placeholder: string,
    value: string,
    onChange: (value: string) => void,
    showPassword: boolean,
    toggleShow: () => void
  ) => {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
          <Input
            id={id}
            type={showPassword ? 'text' : 'password'}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-10 pr-10"
            required
          />
          <button
            type="button"
            onClick={toggleShow}
            className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="w-5 h-5" />
          {t('changePassword')}
        </CardTitle>
        <CardDescription>
          {t('changePasswordDescription')}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {renderPasswordInput(
            'currentPassword',
            t('currentPassword'),
            t('enterCurrentPassword'),
            currentPassword,
            setCurrentPassword,
            showCurrentPassword,
            () => setShowCurrentPassword(!showCurrentPassword)
          )}
          
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            {renderPasswordInput(
              'newPassword',
              t('newPassword'),
              t('enterNewPassword'),
              newPassword,
              setNewPassword,
              showNewPassword,
              () => setShowNewPassword(!showNewPassword)
            )}
            
            {newPassword && (
              <div className="mt-2 space-y-2">
                <Label className="text-sm">{t('passwordStrength')}</Label>
                <div className="space-y-1">
                  <Progress 
                    value={passwordStrength} 
                    className={`h-2 ${getPasswordStrengthColor()}`}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-neutral-500">
                      {getPasswordStrengthText()}
                    </p>
                    <div className="flex gap-1 text-xs text-neutral-500">
                      <span className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>A-Z</span>
                      <span>•</span>
                      <span className={/[a-z]/.test(newPassword) ? 'text-green-600' : ''}>a-z</span>
                      <span>•</span>
                      <span className={/[0-9]/.test(newPassword) ? 'text-green-600' : ''}>0-9</span>
                      <span>•</span>
                      <span className={newPassword.length >= 8 ? 'text-green-600' : ''}>8+</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {renderPasswordInput(
            'confirmPassword',
            t('confirmNewPassword'),
            t('enterConfirmPassword'),
            confirmPassword,
            setConfirmPassword,
            showConfirmPassword,
            () => setShowConfirmPassword(!showConfirmPassword)
          )}
          
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                {t('passwordMismatch')}
              </AlertDescription>
            </Alert>
          )}
          
          {newPassword && currentPassword && newPassword === currentPassword && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                {t('newPasswordMustBeDifferent')}
              </AlertDescription>
            </Alert>
          )}
          
          <Alert>
            <Shield className="w-4 h-4" />
            <AlertDescription className="text-xs">
              <strong>{t('passwordRequirements')}:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>{t('atLeast8Characters')}</li>
                <li>{t('oneUppercase')}</li>
                <li>{t('oneLowercase')}</li>
                <li>{t('oneNumber')}</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
        
        <CardFooter className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
          )}
          
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('changing')}...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                {t('changePassword')}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
