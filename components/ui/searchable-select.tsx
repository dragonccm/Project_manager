"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  Check, 
  ChevronsUpDown, 
  Search, 
  Star, 
  Plus, 
  X,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"
import { fuzzySearch, highlightMatches, type SearchResult } from "@/lib/fuzzy-search"

export interface SearchableOption {
  value: string | number
  label: string
  description?: string
  group?: string
  disabled?: boolean
  icon?: React.ReactNode
  metadata?: any
}

interface SearchableSelectProps {
  options: SearchableOption[]
  value?: string | number | (string | number)[]
  onChange?: (value: string | number | (string | number)[]) => void
  onSearch?: (query: string) => void
  placeholder?: string
  searchPlaceholder?: string
  label?: string
  multiple?: boolean
  disabled?: boolean
  required?: boolean
  clearable?: boolean
  creatable?: boolean
  onCreate?: (label: string) => void
  loading?: boolean
  error?: string
  className?: string
  searchKeys?: string[]
  maxHeight?: number
  showFavorites?: boolean
  favorites?: (string | number)[]
  onFavoriteToggle?: (value: string | number) => void
  groupBy?: string
  virtualizeThreshold?: number
  renderOption?: (option: SearchableOption, isSelected: boolean) => React.ReactNode
  renderValue?: (value: string | number | (string | number)[]) => React.ReactNode
  emptyMessage?: string
  createMessage?: string
  noResultsMessage?: string
}

export function SearchableSelect({
  options = [],
  value,
  onChange,
  onSearch,
  placeholder = "Select option...",
  searchPlaceholder = "Search options...",
  label,
  multiple = false,
  disabled = false,
  required = false,
  clearable = true,
  creatable = false,
  onCreate,
  loading = false,
  error,
  className = "",
  searchKeys = ['label', 'description'],
  maxHeight = 300,
  showFavorites = false,
  favorites = [],
  onFavoriteToggle,
  groupBy,
  virtualizeThreshold = 100,
  renderOption,
  renderValue,
  emptyMessage = "No options available",
  createMessage = "Create option",
  noResultsMessage = "No results found"
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedValues, setSelectedValues] = useState<(string | number)[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize selected values
  useEffect(() => {
    if (multiple && Array.isArray(value)) {
      setSelectedValues(value)
    } else if (!multiple && value !== undefined && !Array.isArray(value)) {
      setSelectedValues([value])
    } else {
      setSelectedValues([])
    }
  }, [value, multiple])

  // Perform fuzzy search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return options

    const results = fuzzySearch(options, searchQuery, {
      keys: searchKeys,
      threshold: 0.3,
      shouldSort: true,
      includeMatches: true
    })

    return results.map(result => result.item)
  }, [options, searchQuery, searchKeys])

  // Group options if groupBy is specified
  const groupedOptions = useMemo(() => {
    if (!groupBy) return { '': searchResults }

    return searchResults.reduce((groups, option) => {
      const group = (option as any)[groupBy] || 'Other'
      if (!groups[group]) groups[group] = []
      groups[group].push(option)
      return groups
    }, {} as Record<string, SearchableOption[]>)
  }, [searchResults, groupBy])

  // Separate favorites
  const favoriteOptions = useMemo(() => {
    if (!showFavorites || !favorites.length) return []
    return options.filter(option => favorites.includes(option.value))
  }, [options, favorites, showFavorites])

  const handleSelect = (optionValue: string | number) => {
    if (disabled) return

    let newValues: (string | number)[]

    if (multiple) {
      if (selectedValues.includes(optionValue)) {
        newValues = selectedValues.filter(v => v !== optionValue)
      } else {
        newValues = [...selectedValues, optionValue]
      }
    } else {
      newValues = [optionValue]
      setOpen(false)
    }

    setSelectedValues(newValues)
    onChange?.(multiple ? newValues : newValues[0])
  }

  const handleClear = () => {
    setSelectedValues([])
    onChange?.(multiple ? [] : '')
  }

  const handleCreate = () => {
    if (searchQuery.trim() && onCreate) {
      onCreate(searchQuery.trim())
      setSearchQuery('')
    }
  }

  const handleFavoriteToggle = (optionValue: string | number) => {
    onFavoriteToggle?.(optionValue)
  }

  const getDisplayValue = () => {
    if (renderValue) {
      return renderValue(multiple ? selectedValues : selectedValues[0])
    }

    if (!selectedValues.length) return placeholder

    if (multiple) {
      return `${selectedValues.length} selected`
    }

    const option = options.find(opt => opt.value === selectedValues[0])
    return option?.label || String(selectedValues[0])
  }

  const renderOptionItem = (option: SearchableOption) => {
    const isSelected = selectedValues.includes(option.value)
    const isFavorite = favorites.includes(option.value)

    if (renderOption) {
      return renderOption(option, isSelected)
    }

    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{option.label}</div>
            {option.description && (
              <div className="text-sm text-muted-foreground truncate">
                {option.description}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {showFavorites && onFavoriteToggle && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                handleFavoriteToggle(option.value)
              }}
            >
              <Star className={cn("h-3 w-3", isFavorite && "fill-current text-yellow-500")} />
            </Button>
          )}
          {isSelected && <Check className="h-4 w-4" />}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "justify-between w-full",
              error && "border-destructive",
              !selectedValues.length && "text-muted-foreground"
            )}
          >
            <span className="truncate">{getDisplayValue()}</span>
            <div className="flex items-center space-x-1">
              {clearable && selectedValues.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClear()
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={searchQuery}
              onValueChange={(value) => {
                setSearchQuery(value)
                onSearch?.(value)
              }}
            />
            
            <CommandList style={{ maxHeight }}>
              {loading ? (
                <CommandEmpty>Loading...</CommandEmpty>
              ) : searchResults.length === 0 && !searchQuery ? (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              ) : searchResults.length === 0 && searchQuery ? (
                <CommandGroup>
                  <CommandEmpty>{noResultsMessage}</CommandEmpty>
                  {creatable && searchQuery.trim() && (
                    <CommandItem
                      value={searchQuery}
                      onSelect={handleCreate}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {createMessage}: "{searchQuery}"
                    </CommandItem>
                  )}
                </CommandGroup>
              ) : (
                <>
                  {/* Favorites Section */}
                  {showFavorites && favoriteOptions.length > 0 && (
                    <CommandGroup heading="Favorites">
                      {favoriteOptions.map((option) => (
                        <CommandItem
                          key={`fav-${option.value}`}
                          value={String(option.value)}
                          onSelect={() => handleSelect(option.value)}
                          disabled={option.disabled}
                        >
                          {renderOptionItem(option)}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {/* Main Options */}
                  {Object.entries(groupedOptions).map(([group, groupOptions]) => (
                    <CommandGroup key={group} heading={group !== '' ? group : undefined}>
                      {groupOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={String(option.value)}
                          onSelect={() => handleSelect(option.value)}
                          disabled={option.disabled}
                        >
                          {renderOptionItem(option)}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}

                  {/* Create Option */}
                  {creatable && searchQuery.trim() && !searchResults.some(opt => 
                    opt.label.toLowerCase() === searchQuery.toLowerCase()
                  ) && (
                    <CommandGroup>
                      <CommandItem
                        value={`create-${searchQuery}`}
                        onSelect={handleCreate}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        {createMessage}: "{searchQuery}"
                      </CommandItem>
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Values Display for Multiple */}
      {multiple && selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedValues.map((val) => {
            const option = options.find(opt => opt.value === val)
            return (
              <Badge
                key={val}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {option?.label || String(val)}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0"
                  onClick={() => handleSelect(val)}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

export default SearchableSelect