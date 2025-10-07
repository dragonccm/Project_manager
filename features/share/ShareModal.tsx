import React, { useState } from 'react'
import { useLanguage } from '@/hooks/use-language'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { 
  Share2, 
  Copy, 
  Check, 
  Trash2, 
  Eye, 
  Clock, 
  Calendar,
  Link as LinkIcon
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { format } from 'date-fns'

export interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resourceType: 'task' | 'note' | 'account' | 'project' | 'report'
  resourceId: string
  resourceName: string
}

interface ShareData {
  shareId: string
  token: string
  shareUrl: string
  expiresAt: Date | null
  accessCount: number
}

export function ShareModal({
  open,
  onOpenChange,
  resourceType,
  resourceId,
  resourceName,
}: ShareModalProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [shareData, setShareData] = useState<ShareData | null>(null)
  const [expiresIn, setExpiresIn] = useState<'1h' | '24h' | '1d' | '7d' | '1M' | '30d' | 'never' | 'custom'>('7d')
  const [customDate, setCustomDate] = useState<Date>()
  const [customTime, setCustomTime] = useState<string>('12:00')
  const [copied, setCopied] = useState(false)

  const handleGenerateLink = async () => {
    setLoading(true)
    try {
      let expiryValue = expiresIn
      let customExpiryDate = null

      // Handle custom time
      if (expiresIn === 'custom') {
        if (!customDate) {
          toast({
            title: t('error'),
            description: t('selectCustomTime'),
            variant: 'destructive',
          })
          setLoading(false)
          return
        }

        // Combine date and time
        const [hours, minutes] = customTime.split(':')
        const expiryDateTime = new Date(customDate)
        expiryDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

        // Check if date is in the future
        if (expiryDateTime <= new Date()) {
          toast({
            title: t('error'),
            description: 'Custom time must be in the future',
            variant: 'destructive',
          })
          setLoading(false)
          return
        }

        customExpiryDate = expiryDateTime.toISOString()
      }

      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceType,
          resourceId,
          expiresIn: expiresIn === 'custom' ? 'custom' : expiryValue,
          customExpiryDate,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate share link')
      }

      const data = await response.json()
      setShareData({
        shareId: data.shareId,
        token: data.token,
        shareUrl: data.shareUrl,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        accessCount: data.accessCount || 0,
      })

      toast({
        title: t('success'),
        description: t('shareCreated'),
      })
    } catch (error) {
      console.error('Error generating share link:', error)
      toast({
        title: t('error'),
        description: t('failedToGenerateLink'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareData) return

    try {
      await navigator.clipboard.writeText(shareData.shareUrl)
      setCopied(true)
      toast({
        title: t('success'),
        description: t('shareCopied'),
      })

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast({
        title: t('error'),
        description: t('failedToCopy'),
        variant: 'destructive',
      })
    }
  }

  const handleRevokeAccess = async () => {
    if (!shareData) return

    if (!window.confirm(t('confirmRevokeAccess'))) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/share/${shareData.token}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to revoke share')
      }

      setShareData(null)
      toast({
        title: t('success'),
        description: t('shareRevoked'),
      })
    } catch (error) {
      console.error('Error revoking share:', error)
      toast({
        title: t('error'),
        description: t('failedToRevokeShare'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatExpiryDate = (date: Date | null) => {
    if (!date) return t('never')
    return new Intl.DateTimeFormat(t('locale'), {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            {t('shareLink')}
          </DialogTitle>
          <DialogDescription>
            {t('shareDescription').replace('{name}', resourceName)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!shareData ? (
            // Generate Link Form
            <>
              <div className="space-y-2">
                <Label>{t('expiresIn')}</Label>
                <Select value={expiresIn} onValueChange={(value: any) => setExpiresIn(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {t('hour1')}
                      </span>
                    </SelectItem>
                    <SelectItem value="24h">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {t('hours24')}
                      </span>
                    </SelectItem>
                    <SelectItem value="1d">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {t('day1')}
                      </span>
                    </SelectItem>
                    <SelectItem value="7d">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {t('days7')}
                      </span>
                    </SelectItem>
                    <SelectItem value="1M">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {t('month1')}
                      </span>
                    </SelectItem>
                    <SelectItem value="30d">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {t('days30')}
                      </span>
                    </SelectItem>
                    <SelectItem value="never">
                      <span className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        {t('untilDisabled')}
                      </span>
                    </SelectItem>
                    <SelectItem value="custom">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {t('customTime')}
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {expiresIn === 'custom' && (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                  <Label>{t('selectCustomTime')}</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1 justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {customDate ? format(customDate, 'PPP') : t('selectDate')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={customDate}
                          onSelect={setCustomDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="time"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleGenerateLink}
                disabled={loading}
                className="w-full"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {loading ? t('generating') : t('generateLink')}
              </Button>
            </>
          ) : (
            // Share Link Display
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>{t('publicLink')}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={shareData.shareUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant={copied ? 'default' : 'outline'}
                      size="icon"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {t('viewsCount').replace('{count}', shareData.accessCount.toString())}
                  </Badge>
                  
                  {shareData.expiresAt ? (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {t('expiresOn')}: {formatExpiryDate(shareData.expiresAt)}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      {t('shareNeverExpires')}
                    </Badge>
                  )}
                </div>

                <div className="pt-2 space-y-2">
                  <Button
                    onClick={handleRevokeAccess}
                    disabled={loading}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('revokeAccess')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
