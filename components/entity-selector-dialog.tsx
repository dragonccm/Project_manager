'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { 
  CheckSquare, 
  FolderOpen, 
  Users, 
  StickyNote,
  Search,
  Loader2
} from 'lucide-react'
import { DataCardType } from '@/types/database'

interface EntitySelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialType?: DataCardType
  onSelect: (entityType: DataCardType, entityId: string, entityName: string) => void
}

export default function EntitySelectorDialog({
  open,
  onOpenChange,
  initialType = 'note',
  onSelect
}: EntitySelectorDialogProps) {
  const { toast } = useToast()
  const [entityType, setEntityType] = useState<DataCardType>(initialType)
  const [entities, setEntities] = useState<any[]>([])
  const [filteredEntities, setFilteredEntities] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchEntities()
    }
  }, [open, entityType])

  useEffect(() => {
    if (searchQuery) {
      const filtered = entities.filter(entity => {
        const searchFields = [
          entity.name,
          entity.title,
          entity.username,
          entity.description,
          entity.content
        ].filter(Boolean)
        
        return searchFields.some(field =>
          field.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
      setFilteredEntities(filtered)
    } else {
      setFilteredEntities(entities)
    }
  }, [searchQuery, entities])

  const fetchEntities = async () => {
    setLoading(true)
    try {
      let endpoint = ''
      switch (entityType) {
        case 'task':
          endpoint = '/api/tasks'
          break
        case 'project':
          endpoint = '/api/projects'
          break
        case 'account':
          endpoint = '/api/accounts'
          break
        case 'note':
          endpoint = '/api/notes'
          break
      }

      const response = await fetch(endpoint)
      if (!response.ok) throw new Error('Failed to fetch entities')

      const data = await response.json()
      setEntities(Array.isArray(data) ? data : [])
      setFilteredEntities(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching entities:', error)
      toast({
        title: "Error",
        description: "Failed to load entities",
        variant: "destructive"
      })
      setEntities([])
      setFilteredEntities([])
    } finally {
      setLoading(false)
    }
  }

  const getEntityIcon = (type: DataCardType) => {
    switch (type) {
      case 'task': return <CheckSquare className="w-4 h-4" />
      case 'project': return <FolderOpen className="w-4 h-4" />
      case 'account': return <Users className="w-4 h-4" />
      case 'note': return <StickyNote className="w-4 h-4" />
    }
  }

  const getEntityName = (entity: any) => {
    return entity.name || entity.title || entity.username || 'Unnamed'
  }

  const getEntityDescription = (entity: any) => {
    if (entity.description) return entity.description
    if (entity.content) {
      // Handle content as string or strip HTML if it exists
      const contentStr = typeof entity.content === 'string' 
        ? entity.content 
        : JSON.stringify(entity.content)
      // Remove HTML tags and limit length
      const plainText = contentStr.replace(/<[^>]*>/g, '').trim()
      return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText
    }
    if (entity.email) return entity.email
    if (entity.domain) return entity.domain
    return ''
  }

  const handleSelect = () => {
    const selectedEntity = entities.find(e => e._id === selectedId || e.id === selectedId)
    if (selectedEntity) {
      onSelect(entityType, selectedId, getEntityName(selectedEntity))
      onOpenChange(false)
      toast({
        title: "Entity Selected",
        description: `${entityType} "${getEntityName(selectedEntity)}" has been selected`
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Entity for Data Card</DialogTitle>
          <DialogDescription>
            Choose an entity to display in your data card
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Entity Type Selector */}
          <div className="space-y-2">
            <Label>Entity Type</Label>
            <Select value={entityType} onValueChange={(v) => setEntityType(v as DataCardType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
                    <span>Tasks</span>
                  </div>
                </SelectItem>
                <SelectItem value="project">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    <span>Projects</span>
                  </div>
                </SelectItem>
                <SelectItem value="account">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Accounts</span>
                  </div>
                </SelectItem>
                <SelectItem value="note">
                  <div className="flex items-center gap-2">
                    <StickyNote className="w-4 h-4" />
                    <span>Notes</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Entity List */}
          <div className="space-y-2">
            <Label>
              Select {entityType.charAt(0).toUpperCase() + entityType.slice(1)} 
              {loading && <Loader2 className="w-4 h-4 inline-block ml-2 animate-spin" />}
              {!loading && ` (${filteredEntities.length})`}
            </Label>
            <ScrollArea className="h-[300px] rounded-md border">
              <div className="p-4 space-y-2">
                {loading ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p>Loading entities...</p>
                  </div>
                ) : filteredEntities.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p>No entities found</p>
                  </div>
                ) : (
                  filteredEntities.map((entity) => {
                    const entityId = entity._id || entity.id
                    return (
                      <div
                        key={entityId}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:border-primary ${
                          selectedId === entityId ? 'border-primary bg-primary/5' : 'border-transparent'
                        }`}
                        onClick={() => setSelectedId(entityId)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getEntityIcon(entityType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {getEntityName(entity)}
                            </h4>
                            {getEntityDescription(entity) && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {getEntityDescription(entity)}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {entity.status && (
                                <Badge variant="outline" className="text-xs">
                                  {entity.status}
                                </Badge>
                              )}
                              {entity.role && (
                                <Badge variant="outline" className="text-xs">
                                  {entity.role}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                ID: {entityId.substring(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedId}>
            Select Entity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
