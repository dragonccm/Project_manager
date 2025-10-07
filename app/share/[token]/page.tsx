'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/use-language'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import {
  Copy,
  Check,
  AlertCircle,
  Clock,
  Eye,
  Calendar,
  User,
  FileText,
  Code,
  FolderKanban,
  KeyRound,
  Link as LinkIcon,
  Loader2,
  ExternalLink,
  Tag,
  BarChart3,
  Sparkles
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ShareData {
  resourceType: 'task' | 'note' | 'account' | 'project' | 'report'
  expiresAt: string | null
  accessCount: number
  createdAt: string
  sharedBy?: string
  resource: any
}

export default function ShareViewPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useLanguage()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareData, setShareData] = useState<ShareData | null>(null)
  const [copiedFields, setCopiedFields] = useState<Set<string>>(new Set())

  const token = params.token as string

  useEffect(() => {
    if (!token) return

    const fetchShareData = async () => {
      try {
        const response = await fetch(`/api/share/${token}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError(t('shareNotFound'))
          } else if (response.status === 410) {
            setError(t('shareExpired'))
          } else {
            setError(t('error'))
          }
          return
        }

        const data = await response.json()
        if (data.success) {
          setShareData({
            resourceType: data.share.resourceType,
            expiresAt: data.share.expiresAt,
            accessCount: data.share.accessCount,
            createdAt: data.share.createdAt,
            sharedBy: data.share.sharedBy,
            resource: data.resource
          })
        }
      } catch (err) {
        console.error('Error fetching share:', err)
        setError(t('error'))
      } finally {
        setLoading(false)
      }
    }

    fetchShareData()
  }, [token, t])

  const handleCopy = async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedFields(prev => new Set(prev).add(field))
      
      toast({
        title: t('success'),
        description: t('contentCopied'),
      })

      setTimeout(() => {
        setCopiedFields(prev => {
          const newSet = new Set(prev)
          newSet.delete(field)
          return newSet
        })
      }, 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast({
        title: t('error'),
        description: t('failedToCopy'),
        variant: 'destructive',
      })
    }
  }

  const getResourceIcon = () => {
    if (!shareData) return null

    switch (shareData.resourceType) {
      case 'task':
        return <FileText className="w-6 h-6" />
      case 'note':
        return <Code className="w-6 h-6" />
      case 'account':
        return <KeyRound className="w-6 h-6" />
      case 'project':
        return <FolderKanban className="w-6 h-6" />
      case 'report':
        return <BarChart3 className="w-6 h-6" />
      default:
        return <LinkIcon className="w-6 h-6" />
    }
  }

  const getResourceGradient = () => {
    if (!shareData) return 'from-blue-500 to-purple-600'

    switch (shareData.resourceType) {
      case 'task':
        return 'from-blue-500 to-cyan-500'
      case 'note':
        return 'from-purple-500 to-pink-500'
      case 'account':
        return 'from-orange-500 to-red-500'
      case 'project':
        return 'from-green-500 to-emerald-500'
      case 'report':
        return 'from-indigo-500 to-violet-500'
      default:
        return 'from-gray-500 to-slate-600'
    }
  }

  const getResourceTitle = () => {
    if (!shareData || !shareData.resource) return t('sharedContent')

    const resource = shareData.resource
    
    switch (shareData.resourceType) {
      case 'task':
        return resource.name || resource.title || t('task')
      case 'note':
        return resource.name || resource.title || t('note')
      case 'account':
        return resource.website || resource.name || t('account')
      case 'project':
        return resource.name || t('project')
      case 'report':
        return resource.name || resource.template_name || t('report')
      default:
        return t('sharedContent')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('never')
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(t('locale'), {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  }

  const renderCopyButton = (field: string, value: string) => {
    if (!value) return null

    const isCopied = copiedFields.has(field)

    return (
      <Button
        onClick={() => handleCopy(field, value)}
        variant={isCopied ? 'default' : 'outline'}
        size="sm"
        className="ml-2"
      >
        {isCopied ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            {t('copied')}
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            {t('copy')}
          </>
        )}
      </Button>
    )
  }

  const renderResourceContent = () => {
    if (!shareData || !shareData.resource) return null

    const resource = shareData.resource

    switch (shareData.resourceType) {
      case 'task':
        return (
          <div className="space-y-6">
            {resource.name && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800">
                <label className="text-sm font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t('taskName')}
                </label>
                <div className="flex items-center mt-2 gap-2">
                  <p className="text-lg font-semibold flex-1">{resource.name}</p>
                  {renderCopyButton('task-name', resource.name)}
                </div>
              </div>
            )}
            
            {resource.description && (
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {t('description')}
                </label>
                <div className="flex items-start mt-2 gap-2">
                  <p className="text-base whitespace-pre-wrap flex-1 leading-relaxed">{resource.description}</p>
                  {renderCopyButton('task-description', resource.description)}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resource.status && (
                <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-900/50">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2 block">
                    {t('status')}
                  </label>
                  <Badge className="text-sm py-1">{resource.status}</Badge>
                </div>
              )}

              {resource.priority && (
                <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-900/50">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2 block">
                    {t('priority')}
                  </label>
                  <Badge variant="outline" className="text-sm py-1">{resource.priority}</Badge>
                </div>
              )}

              {resource.due_date && (
                <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-900/50">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {t('dueDate')}
                  </label>
                  <p className="text-base font-medium">{formatDate(resource.due_date)}</p>
                </div>
              )}
            </div>
          </div>
        )

      case 'note':
        return (
          <div className="space-y-6">
            {resource.name && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
                <label className="text-sm font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  {t('noteName')}
                </label>
                <div className="flex items-center mt-2 gap-2">
                  <p className="text-lg font-semibold flex-1">{resource.name}</p>
                  {renderCopyButton('note-name', resource.name)}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {resource.category && (
                <Badge className="shadow-sm">{resource.category}</Badge>
              )}
              {resource.type && (
                <Badge variant="outline" className="shadow-sm">{resource.type}</Badge>
              )}
            </div>

            {resource.description && (
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2 block">
                  {t('description')}
                </label>
                <div className="flex items-start gap-2">
                  <p className="text-base whitespace-pre-wrap flex-1 leading-relaxed">{resource.description}</p>
                  {renderCopyButton('note-description', resource.description)}
                </div>
              </div>
            )}

            {resource.code && (
              <div className="relative group">
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  {t('code')}
                </label>
                <div className="relative mt-2">
                  <pre className="bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-950 dark:to-neutral-900 p-6 rounded-lg overflow-x-auto max-h-96 border border-neutral-700 dark:border-neutral-800 shadow-lg">
                    <code className="text-sm text-green-400 font-mono">{resource.code}</code>
                  </pre>
                  <div className="absolute top-2 right-2">
                    {renderCopyButton('note-code', resource.code)}
                  </div>
                </div>
              </div>
            )}

            {resource.tags && resource.tags.length > 0 && (
              <div>
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  {t('tags')}
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {resource.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="shadow-sm">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'account':
        return (
          <div className="space-y-6">
            {resource.website && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-800">
                <label className="text-sm font-semibold text-orange-900 dark:text-orange-300 flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  {t('website')}
                </label>
                <div className="flex items-center mt-2 gap-2">
                  <p className="text-lg font-semibold flex-1">{resource.website}</p>
                  {renderCopyButton('account-website', resource.website)}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resource.username && (
                <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-900/50">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {t('username')}
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-medium flex-1">{resource.username}</p>
                    {renderCopyButton('account-username', resource.username)}
                  </div>
                </div>
              )}

              {resource.email && (
                <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-900/50">
                  <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2 block">
                    {t('email')}
                  </label>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-medium flex-1">{resource.email}</p>
                    {renderCopyButton('account-email', resource.email)}
                  </div>
                </div>
              )}
            </div>

            {resource.notes && (
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2 block">
                  {t('notes')}
                </label>
                <div className="flex items-start gap-2">
                  <p className="text-base whitespace-pre-wrap flex-1 leading-relaxed">{resource.notes}</p>
                  {renderCopyButton('account-notes', resource.notes)}
                </div>
              </div>
            )}

            <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <AlertTitle className="text-amber-900 dark:text-amber-300">{t('securityNote')}</AlertTitle>
              <AlertDescription className="text-amber-800 dark:text-amber-400">
                {t('passwordNotShared')}
              </AlertDescription>
            </Alert>
          </div>
        )

      case 'project':
        return (
          <div className="space-y-6">
            {resource.name && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800">
                <label className="text-sm font-semibold text-green-900 dark:text-green-300 flex items-center gap-2">
                  <FolderKanban className="w-4 h-4" />
                  {t('projectName')}
                </label>
                <div className="flex items-center mt-2 gap-2">
                  <p className="text-lg font-semibold flex-1">{resource.name}</p>
                  {renderCopyButton('project-name', resource.name)}
                </div>
              </div>
            )}

            {resource.domain && (
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-900/50">
                <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  {t('domain')}
                </label>
                <div className="flex items-center gap-2">
                  <p className="text-base font-medium flex-1">{resource.domain}</p>
                  {renderCopyButton('project-domain', resource.domain)}
                </div>
              </div>
            )}

            {resource.figma_link && (
              <div className="p-4 rounded-lg border border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
                <label className="text-xs font-medium text-violet-900 dark:text-violet-300 mb-2 block">
                  {t('figmaLink')}
                </label>
                <div className="flex items-center gap-2">
                  <a 
                    href={resource.figma_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 flex-1 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {resource.figma_link}
                  </a>
                  {renderCopyButton('project-figma', resource.figma_link)}
                </div>
              </div>
            )}

            {resource.description && (
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2 block">
                  {t('description')}
                </label>
                <div className="flex items-start gap-2">
                  <p className="text-base whitespace-pre-wrap flex-1 leading-relaxed">{resource.description}</p>
                  {renderCopyButton('project-description', resource.description)}
                </div>
              </div>
            )}

            {resource.status && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {t('status')}:
                </label>
                <Badge className="shadow-sm">{resource.status}</Badge>
              </div>
            )}
          </div>
        )

      case 'report':
        return (
          <div className="space-y-6">
            {resource.name && (
              <div>
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {t('reportName')}
                </label>
                <div className="flex items-center mt-1">
                  <p className="text-xl font-semibold">{resource.name}</p>
                  {renderCopyButton('report-name', resource.name)}
                </div>
              </div>
            )}

            {resource.description && (
              <div>
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {t('description')}
                </label>
                <div className="flex items-start mt-1">
                  <p className="text-base whitespace-pre-wrap flex-1">{resource.description}</p>
                  {renderCopyButton('report-description', resource.description)}
                </div>
              </div>
            )}

            {resource.selectedFields && resource.selectedFields.length > 0 && (
              <div>
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3 block">
                  {t('reportFields')} ({resource.selectedFields.length})
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {resource.selectedFields.map((field: string, index: number) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-medium">{field}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resource.fieldLayout && resource.fieldLayout.length > 0 && (
              <div>
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3 block">
                  {t('reportLayout')}
                </label>
                <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {t('customLayoutConfigured')}: {resource.fieldLayout.length} {t('fields')}
                  </p>
                </div>
              </div>
            )}

            {resource.reportType && (
              <div>
                <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {t('reportType')}
                </label>
                <div className="mt-1">
                  <Badge variant="outline" className="flex items-center gap-1 w-fit">
                    <BarChart3 className="w-3 h-3" />
                    {resource.reportType}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="text-center text-neutral-500">
            {t('unsupportedResourceType')}
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">{t('loading')}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
              <CardTitle>{t('error')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">{error}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              {t('goToHome')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!shareData) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${getResourceGradient()} opacity-10 blur-3xl rounded-full animate-pulse`} />
        <div className={`absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr ${getResourceGradient()} opacity-10 blur-3xl rounded-full animate-pulse delay-1000`} />
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Header */}
          <div className="text-center mb-8 space-y-4">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${getResourceGradient()} shadow-lg mb-4 animate-bounce`}>
              <div className="text-white">
                {getResourceIcon()}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent">
              {getResourceTitle()}
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
              {shareData.sharedBy && (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {t('sharedBy')}: <span className="font-medium">{shareData.sharedBy}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(shareData.createdAt)}
              </span>
            </div>
          </div>

          {/* Main Content Card */}
          <Card className="border-2 shadow-2xl backdrop-blur-sm bg-white/90 dark:bg-neutral-950/90">
            <CardHeader className={`border-b-2 bg-gradient-to-r ${getResourceGradient()} bg-opacity-5`}>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="flex items-center gap-1 shadow-sm">
                  <Eye className="w-3 h-3" />
                  {t('viewsCount').replace('{count}', shareData.accessCount.toString())}
                </Badge>
                
                {shareData.expiresAt ? (
                  <Badge variant="outline" className="flex items-center gap-1 shadow-sm">
                    <Clock className="w-3 h-3" />
                    {t('expiresOn')}: {formatDate(shareData.expiresAt)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1 shadow-sm">
                    <LinkIcon className="w-3 h-3" />
                    {t('shareNeverExpires')}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6 md:p-8">
              {renderResourceContent()}
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="text-center mt-8 space-y-4">
            <Button 
              onClick={() => router.push('/')} 
              variant="outline"
              size="lg"
              className="shadow-lg hover:shadow-xl transition-shadow"
            >
              {t('goToHome')}
            </Button>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t('poweredBy')} Project Manager
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
