'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/hooks/use-language'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Mail,
  KeyRound,
  Check,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Shield
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'

type Step = 'email' | 'otp' | 'password'

interface ForgotPasswordFormProps {
  onSuccess?: () => void
  onBackToLogin?: () => void
}

export function ForgotPasswordForm({ onSuccess, onBackToLogin }: ForgotPasswordFormProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  
  const [step, setStep] = useState<Step>('email')
  const [loading, setLoading] = useState(false)
  
  // Step 1: Email
  const [email, setEmail] = useState('')
  
  // Step 2: OTP
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [otpTimer, setOtpTimer] = useState(600) // 10 minutes
  const [remainingAttempts, setRemainingAttempts] = useState(5)
  
  // Step 3: Password
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  // OTP Timer countdown
  useEffect(() => {
    if (step === 'otp' && otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer(prev => prev - 1)
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [step, otpTimer])
  
  // Calculate password strength
  useEffect(() => {
    let strength = 0
    if (newPassword.length >= 8) strength += 25
    if (/[A-Z]/.test(newPassword)) strength += 25
    if (/[a-z]/.test(newPassword)) strength += 25
    if (/[0-9]/.test(newPassword)) strength += 25
    
    setPasswordStrength(strength)
  }, [newPassword])
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !validateEmail(email)) {
      toast({
        title: t('error'),
        description: t('invalidEmail'),
        variant: 'destructive',
      })
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (response.status === 429) {
        toast({
          title: t('error'),
          description: data.error,
          variant: 'destructive',
        })
        return
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }
      
      setStep('otp')
      setOtpTimer(data.expiresIn || 600)
      toast({
        title: t('success'),
        description: t('otpSent'),
      })
    } catch (error: any) {
      console.error('Error sending OTP:', error)
      toast({
        title: t('error'),
        description: error.message || t('failedToSendOTP'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!otp || otp.length !== 6) {
      toast({
        title: t('error'),
        description: t('invalidOTPFormat'),
        variant: 'destructive',
      })
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: otp }),
      })
      
      const data = await response.json()
      
      if (response.status === 429) {
        toast({
          title: t('error'),
          description: data.error,
          variant: 'destructive',
        })
        return
      }
      
      if (!response.ok) {
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts)
        }
        
        toast({
          title: t('error'),
          description: data.error || t('otpInvalid'),
          variant: 'destructive',
        })
        return
      }
      
      setResetToken(data.resetToken)
      setStep('password')
      toast({
        title: t('success'),
        description: t('otpVerified'),
      })
    } catch (error: any) {
      console.error('Error verifying OTP:', error)
      toast({
        title: t('error'),
        description: error.message || t('failedToVerifyOTP'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleResendOTP = async () => {
    setOtp('')
    setRemainingAttempts(5)
    await handleSendOTP(new Event('submit') as any)
  }
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast({
        title: t('error'),
        description: t('passwordMismatch'),
        variant: 'destructive',
      })
      return
    }
    
    if (newPassword.length < 8) {
      toast({
        title: t('error'),
        description: t('passwordTooShort'),
        variant: 'destructive',
      })
      return
    }
    
    if (passwordStrength < 75) {
      toast({
        title: t('error'),
        description: t('passwordTooWeak'),
        variant: 'destructive',
      })
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetToken,
          newPassword,
          confirmPassword,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }
      
      toast({
        title: t('success'),
        description: t('passwordResetSuccess'),
      })
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error resetting password:', error)
      toast({
        title: t('error'),
        description: error.message || t('passwordResetFailed'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
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
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="w-5 h-5" />
          {t('forgotPassword')}
        </CardTitle>
        <CardDescription>
          {step === 'email' && t('enterEmailForReset')}
          {step === 'otp' && t('enterOTPSentToEmail')}
          {step === 'password' && t('enterNewPassword')}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Step 1: Email Input */}
        {step === 'email' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('enterEmail')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <Alert>
              <Shield className="w-4 h-4" />
              <AlertDescription>
                {t('otpWillBeSent')}
              </AlertDescription>
            </Alert>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('sending')}...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  {t('sendOTP')}
                </>
              )}
            </Button>
          </form>
        )}
        
        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">{t('otpCode')}</Label>
              <Input
                id="otp"
                type="text"
                placeholder={t('sixDigitCode')}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                required
              />
              <p className="text-xs text-neutral-500 text-center">
                {t('otpExpiresIn')}: {formatTime(otpTimer)}
              </p>
            </div>
            
            {remainingAttempts < 5 && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  {t('remainingAttempts')}: {remainingAttempts}
                </AlertDescription>
              </Alert>
            )}
            
            <Button type="submit" className="w-full" disabled={loading || otpTimer <= 0}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('verifying')}...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {t('verifyOTP')}
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResendOTP}
              disabled={loading || otpTimer > 0}
            >
              {t('resendOTP')}
            </Button>
          </form>
        )}
        
        {/* Step 3: New Password */}
        {step === 'password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('newPassword')}</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder={t('enterNewPassword')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>{t('passwordStrength')}</Label>
              <div className="space-y-1">
                <Progress value={passwordStrength} className={getPasswordStrengthColor()} />
                <p className="text-xs text-neutral-500">{getPasswordStrengthText()}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmNewPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('enterConfirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-xs">
                {t('passwordRequirements')}
              </AlertDescription>
            </Alert>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('resetting')}...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 mr-2" />
                  {t('resetPassword')}
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {step !== 'email' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (step === 'otp') setStep('email')
              if (step === 'password') setStep('otp')
            }}
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')}
          </Button>
        )}
        
        {onBackToLogin && (
          <Button
            variant="link"
            size="sm"
            onClick={onBackToLogin}
            className="ml-auto"
          >
            {t('backToLogin')}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
