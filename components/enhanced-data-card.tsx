'use client'

/**
 * Enhanced Data Card Component
 * Hoàn chỉnh với data binding và customization
 */

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Textarea } from '@/components/ui/textarea'
import { Settings, Database, Link as LinkIcon } from 'lucide-react'
import { DataCard as DataCardType } from '@/types/database'

interface EnhancedDataCardProps {
  data: DataCardType
  onUpdate: (data: DataCardType) => void
  isSelected?: boolean
  onClick?: () => void
}

export default function EnhancedDataCard({
  data,
  onUpdate,
  isSelected = false,
  onClick
}: EnhancedDataCardProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [localData, setLocalData] = useState(data)

  const handleSaveSettings = () => {
    onUpdate(localData)
    setSettingsOpen(false)
  }

  const renderField = (field: any) => {
    switch (field.type) {
      case 'text':
        return (
          <div key={field.key}>
            <span className="font-medium">{field.label}: </span>
            <span>{field.value || 'N/A'}</span>
          </div>
        )
      case 'number':
        return (
          <div key={field.key}>
            <span className="font-medium">{field.label}: </span>
            <span>{field.value !== undefined ? field.value : 'N/A'}</span>
          </div>
        )
      case 'date':
        return (
          <div key={field.key}>
            <span className="font-medium">{field.label}: </span>
            <span>{field.value ? new Date(field.value).toLocaleDateString() : 'N/A'}</span>
          </div>
        )
      case 'status':
        return (
          <div key={field.key} className="flex items-center gap-2">
            <span className="font-medium">{field.label}:</span>
            <Badge variant={field.value === 'active' ? 'default' : 'secondary'}>
              {field.value || 'N/A'}
            </Badge>
          </div>
        )
      case 'tags':
        return (
          <div key={field.key}>
            <span className="font-medium">{field.label}:</span>
            <div className="flex gap-1 mt-1 flex-wrap">
              {field.value && Array.isArray(field.value) ? (
                field.value.map((tag: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No tags</span>
              )}
            </div>
          </div>
        )
      case 'progress':
        return (
          <div key={field.key}>
            <span className="font-medium">{field.label}:</span>
            <div className="mt-1">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${field.value || 0}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {field.value || 0}%
              </span>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Card
        className={`cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-primary' : ''
        }`}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{data.title || 'Data Card'}</CardTitle>
              {data.subtitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {data.subtitle}
                </p>
              )}
            </div>
            {data.icon && (
              <div className="text-2xl">{data.icon}</div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {data.fields.map(renderField)}

          {data.dataSource && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
              <Database className="h-3 w-3" />
              <span>Connected: {data.dataSource.type}</span>
              {data.dataSource.autoUpdate && (
                <Badge variant="outline" className="text-xs">
                  Auto-sync
                </Badge>
              )}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={(e) => {
              e.stopPropagation()
              setSettingsOpen(true)
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Data Card Settings</DialogTitle>
            <DialogDescription>
              Configure data card appearance and data binding
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={localData.title}
                onChange={(e) =>
                  setLocalData({ ...localData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={localData.subtitle || ''}
                onChange={(e) =>
                  setLocalData({ ...localData, subtitle: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon (Emoji)</Label>
              <Input
                id="icon"
                value={localData.icon || ''}
                onChange={(e) =>
                  setLocalData({ ...localData, icon: e.target.value })
                }
                placeholder="📊"
              />
            </div>

            {/* Data Source */}
            <div className="space-y-2 border-t pt-4">
              <Label>Data Source</Label>
              <Select
                value={localData.dataSource?.type || 'none'}
                onValueChange={(value) =>
                  setLocalData({
                    ...localData,
                    dataSource: value === 'none' ? undefined : {
                      type: value as any,
                      entityId: '',
                      fields: [],
                      autoUpdate: false
                    }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>

              {localData.dataSource && (
                <>
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="entity-id">Entity ID</Label>
                    <Input
                      id="entity-id"
                      value={localData.dataSource.entityId}
                      onChange={(e) =>
                        setLocalData({
                          ...localData,
                          dataSource: {
                            ...localData.dataSource!,
                            entityId: e.target.value
                          }
                        })
                      }
                      placeholder="Enter entity ID or leave empty to select"
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="auto-update"
                      checked={localData.dataSource.autoUpdate}
                      onChange={(e) =>
                        setLocalData({
                          ...localData,
                          dataSource: {
                            ...localData.dataSource!,
                            autoUpdate: e.target.checked
                          }
                        })
                      }
                    />
                    <Label htmlFor="auto-update" className="font-normal">
                      Auto-update when source data changes
                    </Label>
                  </div>
                </>
              )}
            </div>

            {/* Fields */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label>Fields</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setLocalData({
                      ...localData,
                      fields: [
                        ...localData.fields,
                        {
                          key: `field-${Date.now()}`,
                          label: 'New Field',
                          value: '',
                          type: 'text'
                        }
                      ]
                    })
                  }}
                >
                  Add Field
                </Button>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {localData.fields.map((field, index) => (
                  <Card key={field.key} className="p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Label</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => {
                            const newFields = [...localData.fields]
                            newFields[index] = {
                              ...field,
                              label: e.target.value
                            }
                            setLocalData({ ...localData, fields: newFields })
                          }}
                          size={1}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={field.type}
                          onValueChange={(value) => {
                            const newFields = [...localData.fields]
                            newFields[index] = {
                              ...field,
                              type: value as any
                            }
                            setLocalData({ ...localData, fields: newFields })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                            <SelectItem value="tags">Tags</SelectItem>
                            <SelectItem value="progress">Progress</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Value</Label>
                        <Input
                          value={field.value?.toString() || ''}
                          onChange={(e) => {
                            const newFields = [...localData.fields]
                            newFields[index] = {
                              ...field,
                              value: e.target.value
                            }
                            setLocalData({ ...localData, fields: newFields })
                          }}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="col-span-2"
                        onClick={() => {
                          setLocalData({
                            ...localData,
                            fields: localData.fields.filter((_, i) => i !== index)
                          })
                        }}
                      >
                        Remove Field
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
