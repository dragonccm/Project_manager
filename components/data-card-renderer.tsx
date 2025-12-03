'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckSquare, 
  FolderOpen, 
  Users, 
  StickyNote,
  Calendar,
  User,
  Tag,
  Clock,
  Mail,
  Phone,
  Briefcase,
  AlertCircle
} from 'lucide-react'
import { DataCardType } from '@/types/database'

interface DataCardRendererProps {
  cardType: DataCardType
  entityId: string
  width?: number
  height?: number
  backgroundColor?: string
  borderColor?: string
  compact?: boolean
}

interface TaskData {
  _id: string
  name: string
  status: string
  priority?: string
  deadline?: string
  assignee?: string
  project_name?: string
}

interface ProjectData {
  _id: string
  name: string
  domain?: string
  status: string
  description?: string
  progress?: number
}

interface AccountData {
  _id: string
  username: string
  email?: string
  role?: string
  phone?: string
  status?: string
}

interface NoteData {
  _id: string
  title: string
  content?: string
  tags?: string[]
  created_at?: string
  updated_at?: string
}

const statusColors: Record<string, string> = {
  'pending': 'bg-yellow-500',
  'in-progress': 'bg-blue-500',
  'in progress': 'bg-blue-500',
  'completed': 'bg-green-500',
  'active': 'bg-green-500',
  'inactive': 'bg-gray-500',
  'cancelled': 'bg-red-500',
  'low': 'bg-gray-400',
  'medium': 'bg-yellow-500',
  'high': 'bg-orange-500',
  'urgent': 'bg-red-500'
}

export default function DataCardRenderer({
  cardType,
  entityId,
  width = 300,
  height = 200,
  backgroundColor = '#ffffff',
  borderColor = '#e5e7eb',
  compact = false
}: DataCardRendererProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [cardType, entityId])

  const fetchData = async () => {
    if (!entityId) {
      setError('No entity ID provided')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let endpoint = ''
      switch (cardType) {
        case 'task':
          endpoint = `/api/tasks`
          break
        case 'project':
          endpoint = `/api/projects`
          break
        case 'account':
          endpoint = `/api/accounts`
          break
        case 'note':
          endpoint = `/api/notes`
          break
      }

      
      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
      }
      
      const allData = await response.json()
      
      // Try multiple ID field names
      const item = Array.isArray(allData) 
        ? allData.find((d: any) => 
            d._id === entityId || 
            d.id === entityId || 
            d._id?.toString() === entityId ||
            d.id?.toString() === entityId
          )
        : allData


      if (!item) {
        // List available IDs for debugging
        if (Array.isArray(allData) && allData.length > 0) {
          const availableIds = allData.slice(0, 5).map((d: any) => d._id || d.id).filter(Boolean)
          throw new Error(`Entity not found. Available IDs: ${availableIds.join(', ')}${allData.length > 5 ? '...' : ''}`)
        }
        throw new Error('Entity not found')
      }

      setData(item)
    } catch (err) {
      console.error('DataCardRenderer error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const renderIcon = () => {
    const iconProps = { className: "w-5 h-5" }
    switch (cardType) {
      case 'task': return <CheckSquare {...iconProps} />
      case 'project': return <FolderOpen {...iconProps} />
      case 'account': return <Users {...iconProps} />
      case 'note': return <StickyNote {...iconProps} />
    }
  }

  const renderTaskCard = (task: TaskData) => (
    <>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          {task.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={statusColors[task.status.toLowerCase()] || 'bg-gray-500'}>
            {task.status}
          </Badge>
          {task.priority && (
            <Badge variant="outline" className={statusColors[task.priority.toLowerCase()]}>
              {task.priority}
            </Badge>
          )}
        </div>
        {task.deadline && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{new Date(task.deadline).toLocaleDateString()}</span>
          </div>
        )}
        {task.assignee && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{task.assignee}</span>
          </div>
        )}
        {task.project_name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="w-4 h-4" />
            <span>{task.project_name}</span>
          </div>
        )}
      </CardContent>
    </>
  )

  const renderProjectCard = (project: ProjectData) => (
    <>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          {project.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Badge className={statusColors[project.status.toLowerCase()] || 'bg-gray-500'}>
          {project.status}
        </Badge>
        {project.domain && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tag className="w-4 h-4" />
            <span>{project.domain}</span>
          </div>
        )}
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
        {project.progress !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </>
  )

  const renderAccountCard = (account: AccountData) => (
    <>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-4 h-4" />
          {account.username}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {account.role && (
          <Badge variant="outline">{account.role}</Badge>
        )}
        {account.status && (
          <Badge className={statusColors[account.status.toLowerCase()] || 'bg-gray-500'}>
            {account.status}
          </Badge>
        )}
        {account.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span className="truncate">{account.email}</span>
          </div>
        )}
        {account.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{account.phone}</span>
          </div>
        )}
      </CardContent>
    </>
  )

  const renderNoteCard = (note: NoteData) => (
    <>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <StickyNote className="w-4 h-4" />
          {note.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {note.content && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {note.content.replace(/<[^>]*>/g, '')}
          </p>
        )}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {note.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        {note.updated_at && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{new Date(note.updated_at).toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>
    </>
  )

  if (loading) {
    return (
      <Card 
        className="animate-pulse" 
        style={{ 
          width, 
          height, 
          backgroundColor, 
          borderColor,
          borderWidth: '1px'
        }}
      >
        <CardHeader className="pb-3">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card 
        className="border-red-200" 
        style={{ 
          width, 
          height, 
          backgroundColor: '#fef2f2', 
          borderColor: '#fecaca'
        }}
      >
        <CardContent className="flex flex-col items-center justify-center h-full text-center p-4">
          <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-sm font-medium text-red-700">
            {error || 'Data not found'}
          </p>
          <p className="text-xs text-red-600 mt-1">
            Entity ID: {entityId}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className="overflow-hidden"
      style={{ 
        width, 
        height, 
        backgroundColor, 
        borderColor,
        borderWidth: '1px'
      }}
    >
      {cardType === 'task' && renderTaskCard(data)}
      {cardType === 'project' && renderProjectCard(data)}
      {cardType === 'account' && renderAccountCard(data)}
      {cardType === 'note' && renderNoteCard(data)}
    </Card>
  )
}
