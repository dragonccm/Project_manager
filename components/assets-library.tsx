'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  Shapes,
  Image,
  Type,
  Layers,
  Plus
} from 'lucide-react'

interface Asset {
  id: string
  name: string
  type: 'shape' | 'image' | 'text' | 'component'
  category?: string
  thumbnail?: string
  data: any
}

interface AssetsLibraryProps {
  assets: Asset[]
  onDragStart?: (asset: Asset) => void
  onAssetClick?: (asset: Asset) => void
  onAddAsset?: (type: Asset['type']) => void
}

/**
 * AssetsLibrary - Thư viện assets với search và drag & drop
 * 
 * Features:
 * - Search/filter assets
 * - Category tabs
 * - Drag & drop to canvas
 * - Asset thumbnails
 * - Add new assets
 * - Collapsible categories
 */
export default function AssetsLibrary({
  assets,
  onDragStart,
  onAssetClick,
  onAddAsset
}: AssetsLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<Asset['type'] | 'all'>('all')

  // Filter assets by search and tab
  const filteredAssets = useMemo(() => {
    let filtered = assets

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(asset => asset.type === activeTab)
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(query) ||
        asset.category?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [assets, activeTab, searchQuery])

  // Group assets by category
  const groupedAssets = useMemo(() => {
    const groups: Record<string, Asset[]> = {}
    
    filteredAssets.forEach(asset => {
      const category = asset.category || 'Uncategorized'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(asset)
    })

    return groups
  }, [filteredAssets])

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, asset: Asset) => {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('application/json', JSON.stringify(asset))
    onDragStart?.(asset)
  }

  // Count assets by type
  const counts = useMemo(() => {
    return {
      all: assets.length,
      shape: assets.filter(a => a.type === 'shape').length,
      image: assets.filter(a => a.type === 'image').length,
      text: assets.filter(a => a.type === 'text').length,
      component: assets.filter(a => a.type === 'component').length
    }
  }, [assets])

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="h-4 w-4" />
          Assets Library
        </CardTitle>
        
        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 h-8"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-5 mx-4">
            <TabsTrigger value="all" className="text-xs">
              All
              <span className="ml-1 text-xs text-muted-foreground">
                {counts.all}
              </span>
            </TabsTrigger>
            <TabsTrigger value="shape" className="text-xs">
              <Shapes className="h-3 w-3" />
              <span className="ml-1">{counts.shape}</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="text-xs">
              <Image className="h-3 w-3" />
              <span className="ml-1">{counts.image}</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="text-xs">
              <Type className="h-3 w-3" />
              <span className="ml-1">{counts.text}</span>
            </TabsTrigger>
            <TabsTrigger value="component" className="text-xs">
              <Layers className="h-3 w-3" />
              <span className="ml-1">{counts.component}</span>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-4">
            <TabsContent value={activeTab} className="mt-4 space-y-4">
              {Object.keys(groupedAssets).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Layers className="h-12 w-12 mb-4 opacity-50" />
                  <p>No assets found</p>
                  <p className="text-sm">
                    {searchQuery ? 'Try a different search' : 'Add assets to get started'}
                  </p>
                </div>
              ) : (
                Object.entries(groupedAssets).map(([category, categoryAssets]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase">
                      {category}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {categoryAssets.map(asset => (
                        <AssetCard
                          key={asset.id}
                          asset={asset}
                          onDragStart={(e) => handleDragStart(e, asset)}
                          onClick={() => onAssetClick?.(asset)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Add New Asset Buttons */}
        {onAddAsset && (
          <div className="p-4 border-t space-y-2">
            <p className="text-xs text-muted-foreground mb-2">Add New Asset</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddAsset('shape')}
                className="h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Shape
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddAsset('image')}
                className="h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Image
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddAsset('text')}
                className="h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Text
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddAsset('component')}
                className="h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Component
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * AssetCard - Individual asset card với thumbnail
 */
interface AssetCardProps {
  asset: Asset
  onDragStart: (e: React.DragEvent) => void
  onClick: () => void
}

function AssetCard({ asset, onDragStart, onClick }: AssetCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="group relative aspect-square rounded-lg border bg-card hover:bg-accent hover:border-primary cursor-move transition-colors"
    >
      {/* Thumbnail */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {asset.thumbnail ? (
          <img
            src={asset.thumbnail}
            alt={asset.name}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <AssetIcon type={asset.type} />
        )}
      </div>

      {/* Name overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-lg">
        <p className="text-xs text-white truncate">{asset.name}</p>
      </div>

      {/* Drag indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-primary text-primary-foreground rounded-full p-1">
          <Plus className="h-3 w-3" />
        </div>
      </div>
    </div>
  )
}

/**
 * AssetIcon - Default icon based on asset type
 */
function AssetIcon({ type }: { type: Asset['type'] }) {
  const iconClass = "h-12 w-12 text-muted-foreground"
  
  switch (type) {
    case 'shape':
      return <Shapes className={iconClass} />
    case 'image':
      return <Image className={iconClass} />
    case 'text':
      return <Type className={iconClass} />
    case 'component':
      return <Layers className={iconClass} />
    default:
      return <Shapes className={iconClass} />
  }
}
