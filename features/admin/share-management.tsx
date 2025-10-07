'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/hooks/use-language'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Copy, 
  ExternalLink, 
  Trash2, 
  Power, 
  PowerOff,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'

interface Share {
  _id: string
  token: string
  resourceType: 'task' | 'note' | 'account' | 'project' | 'report'
  resourceId: string
  resourceName?: string
  createdBy?: string
  createdAt: string
  expiresAt: string | null
  accessCount: number
  lastAccessedAt: string | null
  isActive: boolean
  viewHistory?: Array<{
    viewedAt: string
    ipAddress: string
    userAgent: string
  }>
}

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function ShareManagement() {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [shares, setShares] = useState<Share[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Filters
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('all')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Dialogs
  const [expiryDialog, setExpiryDialog] = useState<{ open: boolean; shareId: string | null; currentExpiry: string | null }>({
    open: false,
    shareId: null,
    currentExpiry: null
  })
  const [newExpiryDate, setNewExpiryDate] = useState('')
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; shareId: string | null }>({
    open: false,
    shareId: null
  })

  // Fetch shares
  const fetchShares = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (resourceTypeFilter !== 'all') {
        params.append('resourceType', resourceTypeFilter)
      }

      if (activeFilter !== 'all') {
        params.append('isActive', activeFilter)
      }

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/share?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setShares(data.data)
        setPagination(data.pagination)
      } else {
        throw new Error(data.error || 'Failed to fetch shares')
      }
    } catch (error) {
      console.error('Error fetching shares:', error)
      toast({
        title: t('error'),
        description: t('failedToFetchShares'),
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShares()
  }, [pagination.page, resourceTypeFilter, activeFilter])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        fetchShares()
      } else {
        setPagination(prev => ({ ...prev, page: 1 }))
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Copy share URL
  const copyShareUrl = (token: string) => {
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/share/${token}`
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: t('success'),
      description: t('linkCopied')
    })
  }

  // Open share in new tab
  const openShare = (token: string) => {
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/share/${token}`
    window.open(shareUrl, '_blank')
  }

  // Toggle active status
  const toggleActive = async (shareId: string) => {
    try {
      const response = await fetch('/api/share', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: t('success'),
          description: t('shareStatusUpdated')
        })
        fetchShares()
      } else {
        throw new Error(data.error || 'Failed to toggle status')
      }
    } catch (error) {
      console.error('Error toggling share status:', error)
      toast({
        title: t('error'),
        description: t('failedToUpdateShare'),
        variant: 'destructive'
      })
    }
  }

  // Update expiry date
  const updateExpiry = async () => {
    if (!expiryDialog.shareId) return

    try {
      const expiresAt = newExpiryDate ? new Date(newExpiryDate).toISOString() : null

      const response = await fetch('/api/share', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shareId: expiryDialog.shareId, 
          expiresAt 
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: t('success'),
          description: t('expiryUpdated')
        })
        setExpiryDialog({ open: false, shareId: null, currentExpiry: null })
        setNewExpiryDate('')
        fetchShares()
      } else {
        throw new Error(data.error || 'Failed to update expiry')
      }
    } catch (error) {
      console.error('Error updating expiry:', error)
      toast({
        title: t('error'),
        description: t('failedToUpdateExpiry'),
        variant: 'destructive'
      })
    }
  }

  // Delete share
  const deleteShare = async () => {
    if (!deleteDialog.shareId) return

    try {
      const share = shares.find(s => s._id === deleteDialog.shareId)
      if (!share) return

      const response = await fetch(`/api/share/${share.token}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: t('success'),
          description: t('shareDeleted')
        })
        setDeleteDialog({ open: false, shareId: null })
        fetchShares()
      } else {
        throw new Error(data.error || 'Failed to delete share')
      }
    } catch (error) {
      console.error('Error deleting share:', error)
      toast({
        title: t('error'),
        description: t('failedToDeleteShare'),
        variant: 'destructive'
      })
    }
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('never')
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Get resource type badge color
  const getResourceTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      task: 'bg-blue-500',
      note: 'bg-green-500',
      account: 'bg-purple-500',
      project: 'bg-orange-500',
      report: 'bg-pink-500'
    }
    return colors[type] || 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{t('shareManagement')}</CardTitle>
          <CardDescription>{t('manageShareLinks')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchShares')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Resource Type Filter */}
            <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t('resourceType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTypes')}</SelectItem>
                <SelectItem value="task">{t('task')}</SelectItem>
                <SelectItem value="note">{t('note')}</SelectItem>
                <SelectItem value="account">{t('account')}</SelectItem>
                <SelectItem value="project">{t('project')}</SelectItem>
                <SelectItem value="report">{t('report')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Active Status Filter */}
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t('status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="true">{t('active')}</SelectItem>
                <SelectItem value="false">{t('inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t('totalShares')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pagination.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t('activeShares')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {shares.filter(s => s.isActive).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t('inactiveShares')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {shares.filter(s => !s.isActive).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('resourceType')}</TableHead>
                  <TableHead>{t('token')}</TableHead>
                  <TableHead>{t('views')}</TableHead>
                  <TableHead>{t('created')}</TableHead>
                  <TableHead>{t('expires')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {t('loading')}...
                    </TableCell>
                  </TableRow>
                ) : shares.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t('noSharesFound')}
                    </TableCell>
                  </TableRow>
                ) : (
                  shares.map((share) => (
                    <TableRow key={share._id}>
                      <TableCell>
                        <Badge className={getResourceTypeBadge(share.resourceType)}>
                          {t(share.resourceType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {share.token.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">{share.accessCount}</span>
                          {share.lastAccessedAt && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(share.lastAccessedAt)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDate(share.createdAt)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDate(share.expiresAt)}
                      </TableCell>
                      <TableCell>
                        {share.isActive ? (
                          <Badge variant="default" className="bg-green-600">
                            {t('active')}
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            {t('inactive')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyShareUrl(share.token)}
                            title={t('copyLink')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openShare(share.token)}
                            title={t('openLink')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setExpiryDialog({
                              open: true,
                              shareId: share._id,
                              currentExpiry: share.expiresAt
                            })}
                            title={t('updateExpiry')}
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleActive(share._id)}
                            title={share.isActive ? t('disable') : t('enable')}
                          >
                            {share.isActive ? (
                              <PowerOff className="h-4 w-4 text-red-600" />
                            ) : (
                              <Power className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteDialog({
                              open: true,
                              shareId: share._id
                            })}
                            title={t('delete')}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {t('showing')} {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} {t('of')} {pagination.total}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={!pagination.hasPrevPage}
              >
                <ChevronLeft className="h-4 w-4" />
                {t('previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={!pagination.hasNextPage}
              >
                {t('next')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Expiry Dialog */}
      <Dialog open={expiryDialog.open} onOpenChange={(open) => {
        setExpiryDialog({ open, shareId: null, currentExpiry: null })
        setNewExpiryDate('')
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('updateExpiry')}</DialogTitle>
            <DialogDescription>
              {t('updateExpiryDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="expiry-date">{t('newExpiryDate')}</Label>
              <Input
                id="expiry-date"
                type="datetime-local"
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t('currentExpiry')}: {formatDate(expiryDialog.currentExpiry)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('leaveEmptyForNeverExpire')}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setExpiryDialog({ open: false, shareId: null, currentExpiry: null })
              setNewExpiryDate('')
            }}>
              {t('cancel')}
            </Button>
            <Button onClick={updateExpiry}>
              {t('update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(isOpen) => {
        setDeleteDialog({ open: isOpen, shareId: null })
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteShare')}</DialogTitle>
            <DialogDescription>
              {t('deleteShareConfirmation')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeleteDialog({ open: false, shareId: null })
            }}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={deleteShare}>
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
