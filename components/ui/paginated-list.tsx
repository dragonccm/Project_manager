'use client'

import React, { useState, useMemo, ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react'

export interface PaginatedListProps<T> {
  // Data
  items: T[]
  
  // Rendering
  renderItem: (item: T, index: number) => ReactNode
  keyExtractor: (item: T, index: number) => string | number
  
  // Pagination
  itemsPerPageOptions?: number[]
  defaultItemsPerPage?: number
  
  // Search
  searchable?: boolean
  searchPlaceholder?: string
  searchKeys?: (keyof T)[]
  onSearch?: (item: T, query: string) => boolean
  
  // Sorting
  sortable?: boolean
  sortOptions?: Array<{
    label: string
    value: string
    compareFn: (a: T, b: T) => number
  }>
  defaultSort?: string
  
  // Filtering
  filters?: Array<{
    label: string
    key: string
    options: Array<{ label: string; value: string }>
    filterFn: (item: T, value: string) => boolean
  }>
  
  // Layout
  emptyState?: ReactNode
  loadingState?: ReactNode
  isLoading?: boolean
  
  // Container styles
  containerClassName?: string
  itemsContainerClassName?: string
  
  // Translations
  translations?: {
    showing: string
    of: string
    items: string
    search: string
    sortBy: string
    noResults: string
    previous: string
    next: string
    firstPage: string
    lastPage: string
  }
}

const defaultTranslations = {
  showing: 'Showing',
  of: 'of',
  items: 'items',
  search: 'Search',
  sortBy: 'Sort by',
  noResults: 'No items found',
  previous: 'Previous',
  next: 'Next',
  firstPage: 'First page',
  lastPage: 'Last page',
}

export function PaginatedList<T>({
  items,
  renderItem,
  keyExtractor,
  itemsPerPageOptions = [12, 20, 40, 60, 100],
  defaultItemsPerPage = 20,
  searchable = false,
  searchPlaceholder,
  searchKeys = [],
  onSearch,
  sortable = false,
  sortOptions = [],
  defaultSort,
  filters = [],
  emptyState,
  loadingState,
  isLoading = false,
  containerClassName = '',
  itemsContainerClassName = '',
  translations = defaultTranslations,
}: PaginatedListProps<T>) {
  const t = { ...defaultTranslations, ...translations }
  
  // State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState(defaultSort || sortOptions[0]?.value || '')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    filters.reduce((acc, filter) => ({ ...acc, [filter.key]: 'all' }), {})
  )

  // Filter and search logic
  const filteredItems = useMemo(() => {
    let result = [...items]

    // Apply filters
    filters.forEach((filter) => {
      const filterValue = activeFilters[filter.key]
      if (filterValue && filterValue !== 'all') {
        result = result.filter((item) => filter.filterFn(item, filterValue))
      }
    })

    // Apply search
    if (searchable && searchQuery) {
      result = result.filter((item) => {
        if (onSearch) {
          return onSearch(item, searchQuery)
        }
        
        // Default search behavior: search in specified keys
        if (searchKeys.length > 0) {
          return searchKeys.some((key) => {
            const value = item[key]
            if (typeof value === 'string') {
              return value.toLowerCase().includes(searchQuery.toLowerCase())
            }
            if (typeof value === 'number') {
              return value.toString().includes(searchQuery)
            }
            return false
          })
        }
        
        // If no search keys, search in all string properties
        return Object.values(item as any).some((value) => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchQuery.toLowerCase())
          }
          if (typeof value === 'number') {
            return value.toString().includes(searchQuery)
          }
          return false
        })
      })
    }

    // Apply sorting
    if (sortable && sortBy) {
      const sortOption = sortOptions.find((opt) => opt.value === sortBy)
      if (sortOption) {
        result.sort(sortOption.compareFn)
      }
    }

    return result
  }, [items, activeFilters, searchQuery, sortBy, searchable, sortable, searchKeys, onSearch, filters, sortOptions])

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, filteredItems.length)
  const paginatedItems = filteredItems.slice(startIndex, endIndex)

  // Reset to page 1 when filters/search change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeFilters, sortBy, itemsPerPage])

  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value))
    setCurrentPage(1)
  }

  const handleFilterChange = (filterKey: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [filterKey]: value }))
  }

  // Loading state
  if (isLoading && loadingState) {
    return <div className={containerClassName}>{loadingState}</div>
  }

  return (
    <div className={`space-y-4 ${containerClassName}`}>
      {/* Search and Filters */}
      {(searchable || sortable || filters.length > 0) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder || t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-2">
            {/* Custom Filters */}
            {filters.map((filter) => (
              <Select
                key={filter.key}
                value={activeFilters[filter.key]}
                onValueChange={(value) => handleFilterChange(filter.key, value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.label}</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}

            {/* Sort */}
            {sortable && sortOptions.length > 0 && (
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t.sortBy} />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}

      {/* Items Grid/List */}
      {paginatedItems.length === 0 ? (
        <div className="text-center py-12">
          {emptyState || (
            <div className="text-gray-500">
              <p className="text-lg font-medium">{t.noResults}</p>
            </div>
          )}
        </div>
      ) : (
        <div className={itemsContainerClassName}>
          {paginatedItems.map((item, index) => (
            <React.Fragment key={keyExtractor(item, startIndex + index)}>
              {renderItem(item, startIndex + index)}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredItems.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t pt-4">
          {/* Items per page + Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {itemsPerPageOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
            
            <div className="text-sm text-gray-600">
              {t.showing} <span className="font-medium">{startIndex + 1}</span> -{' '}
              <span className="font-medium">{endIndex}</span> {t.of}{' '}
              <span className="font-medium">{filteredItems.length}</span> {t.items}
            </div>
          </div>

          {/* Page Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                title={t.firstPage}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">{t.previous}</span>
              </Button>

              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="hidden sm:inline mr-1">{t.next}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                title={t.lastPage}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
