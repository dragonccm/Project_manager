"use client"

import { useState, useEffect, useCallback, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LazyLoadListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  batchSize?: number
  loadingText?: string
  noMoreText?: string
  emptyMessage?: string
  className?: string
  itemClassName?: string
  getItemKey?: (item: T, index: number) => string | number
}

export function LazyLoadList<T>({
  items,
  renderItem,
  batchSize = 10,
  loadingText = "Loading more...",
  noMoreText = "No more items",
  emptyMessage = "No items to display",
  className,
  itemClassName,
  getItemKey
}: LazyLoadListProps<T>) {
  const [displayedItems, setDisplayedItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // Initialize with first batch
  useEffect(() => {
    const firstBatch = items.slice(0, batchSize)
    setDisplayedItems(firstBatch)
    setHasMore(items.length > batchSize)
  }, [items, batchSize])

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return

    setLoading(true)
    
    // Simulate async loading
    setTimeout(() => {
      const currentLength = displayedItems.length
      const nextBatch = items.slice(currentLength, currentLength + batchSize)
      
      setDisplayedItems(prev => [...prev, ...nextBatch])
      setHasMore(currentLength + batchSize < items.length)
      setLoading(false)
    }, 300)
  }, [loading, hasMore, displayedItems.length, items, batchSize])

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      <div className={className}>
        {displayedItems.map((item, index) => {
          const key = getItemKey ? getItemKey(item, index) : `item-${index}`
          return <div key={key}>{renderItem(item, index)}</div>
        })}
      </div>
      
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline" 
            onClick={loadMore} 
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {loadingText}
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
      
      {!hasMore && items.length > batchSize && (
        <div className="text-center mt-6 text-sm text-muted-foreground">
          {noMoreText}
        </div>
      )}
      
      <div className="text-center mt-2 text-xs text-muted-foreground">
        Showing {displayedItems.length} of {items.length} items
      </div>
    </>
  )
}

// Specialized component for paginated data with search
interface LazySearchListProps<T> extends LazyLoadListProps<T> {
  searchTerm: string
  filterFn: (item: T, searchTerm: string) => boolean
  searchPlaceholder?: string
  onSearchChange: (term: string) => void
}

export function LazySearchList<T>({
  items,
  renderItem,
  searchTerm,
  filterFn,
  searchPlaceholder = "Search...",
  onSearchChange,
  ...props
}: LazySearchListProps<T>) {
  const filteredItems = items.filter(item => filterFn(item, searchTerm))

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>
      
      <LazyLoadList 
        {...props}
        items={filteredItems}
        renderItem={renderItem}
      />
    </div>
  )
}

// Hook for infinite scroll lazy loading
export function useInfiniteScroll(
  callback: () => void,
  hasMore: boolean,
  loading: boolean
) {
  useEffect(() => {
    if (!hasMore || loading) return

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      if (scrollTop + windowHeight >= documentHeight - 100) {
        callback()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [callback, hasMore, loading])
}

// Virtualized list for very large datasets
interface VirtualizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length
  )

  const startIndex = Math.max(0, visibleStart - overscan)
  const endIndex = Math.min(items.length, visibleEnd + overscan)

  const visibleItems = items.slice(startIndex, endIndex)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  return (
    <div
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${startIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => 
            renderItem(item, startIndex + index)
          )}
        </div>
      </div>
    </div>
  )
}