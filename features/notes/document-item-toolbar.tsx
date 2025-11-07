"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DocumentItem } from '@/types/database'
import { Type, FileText, Image, Square, Tag, Circle } from 'lucide-react'
import { nanoid } from 'nanoid'

interface DocumentItemToolbarProps {
  onAddItem: (item: DocumentItem) => void
}

export function DocumentItemToolbar({ onAddItem }: DocumentItemToolbarProps) {
  const createItem = (type: DocumentItem['type']) => {
    const baseItem: Partial<DocumentItem> = {
      id: nanoid(),
      type,
      x_mm: 20,
      y_mm: 20,
      width_mm: 50,
      height_mm: 20,
      z_index: 0,
      locked: false,
      style: {
        font_family: 'Arial',
        font_size_pt: 12,
        font_weight: 'normal',
        text_align: 'left',
        text_color: '#000000',
        background_color: '#ffffff',
        border_width: 1,
        border_color: '#cccccc',
        border_style: 'solid',
        border_radius: 0,
        padding_top_mm: 2,
        padding_right_mm: 2,
        padding_bottom_mm: 2,
        padding_left_mm: 2,
        opacity: 1
      },
      content: {}
    }

    switch (type) {
      case 'title':
        return {
          ...baseItem,
          width_mm: 150,
          height_mm: 30,
          style: {
            ...baseItem.style,
            font_size_pt: 24,
            font_weight: 'bold'
          },
          content: {
            text: 'Title'
          }
        } as DocumentItem

      case 'text':
        return {
          ...baseItem,
          width_mm: 100,
          height_mm: 40,
          content: {
            text: 'Text content'
          }
        } as DocumentItem

      case 'image':
        return {
          ...baseItem,
          width_mm: 80,
          height_mm: 60,
          style: {
            ...baseItem.style,
            border_width: 0
          },
          content: {
            image_url: '',
            preserve_aspect: true
          }
        } as DocumentItem

      case 'shape':
        return {
          ...baseItem,
          width_mm: 40,
          height_mm: 40,
          content: {
            shape_type: 'rectangle',
            fill_color: '#e0e0e0'
          }
        } as DocumentItem

      case 'tag':
        return {
          ...baseItem,
          width_mm: 60,
          height_mm: 25,
          style: {
            ...baseItem.style,
            background_color: '#e0f2fe',
            border_color: '#0ea5e9',
            border_width: 2
          },
          content: {
            tag_label: 'Tag'
          }
        } as DocumentItem

      default:
        return baseItem as DocumentItem
    }
  }

  const itemTypes = [
    { type: 'title' as const, icon: Type, label: 'Title', description: 'Large heading text' },
    { type: 'text' as const, icon: FileText, label: 'Text', description: 'Paragraph text' },
    { type: 'image' as const, icon: Image, label: 'Image', description: 'Insert image' },
    { type: 'shape' as const, icon: Square, label: 'Shape', description: 'Rectangle, circle, etc.' },
    { type: 'tag' as const, icon: Tag, label: 'Tag', description: 'Entity reference tag' }
  ]

  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium mr-2">Add Item:</span>
        {itemTypes.map(({ type, icon: Icon, label, description }) => (
          <Button
            key={type}
            size="sm"
            variant="outline"
            onClick={() => onAddItem(createItem(type))}
            title={description}
            className="gap-2"
          >
            <Icon className="w-4 h-4" />
            {label}
          </Button>
        ))}
      </div>
    </Card>
  )
}
