"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, HelpCircle } from "lucide-react"
import { 
  parseTimeInput, 
  formatTimeDisplay, 
  validateTimeInput, 
  minutesToHours, 
  type TimeUnit 
} from "@/lib/time-utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TimeInputProps {
  label?: string
  placeholder?: string
  value?: number // Value in minutes
  onChange?: (minutes: number) => void
  onValidationChange?: (isValid: boolean) => void
  className?: string
  required?: boolean
  showPreview?: boolean
  showSuggestions?: boolean
  disabled?: boolean
  error?: string
}

const TIME_SUGGESTIONS = [
  { display: "15m", minutes: 15, description: "Quick task" },
  { display: "30m", minutes: 30, description: "Short task" },
  { display: "1h", minutes: 60, description: "Standard task" },
  { display: "2h", minutes: 120, description: "Long task" },
  { display: "4h", minutes: 240, description: "Half day" },
  { display: "8h", minutes: 480, description: "Full day" }
]

export function TimeInput({
  label = "Time",
  placeholder = "e.g., 2h, 90m, 1.5h, 2:30",
  value,
  onChange,
  onValidationChange,
  className = "",
  required = false,
  showPreview = true,
  showSuggestions = false,
  disabled = false,
  error
}: TimeInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [internalError, setInternalError] = useState<string | null>(null)
  const [preview, setPreview] = useState<TimeUnit | null>(null)
  const [showHelp, setShowHelp] = useState(false)

  // Initialize input value from prop
  useEffect(() => {
    if (value !== undefined && value > 0) {
      setInputValue(formatTimeDisplay(value))
    } else {
      setInputValue("")
    }
  }, [value])

  // Validate and update preview on input change
  useEffect(() => {
    if (!inputValue.trim()) {
      setInternalError(null)
      setPreview(null)
      onValidationChange?.(true)
      return
    }

    const validationError = validateTimeInput(inputValue)
    setInternalError(validationError)
    onValidationChange?.(!validationError)

    if (!validationError) {
      const minutes = parseTimeInput(inputValue)
      if (minutes !== null) {
        setPreview(minutesToHours(minutes))
      }
    } else {
      setPreview(null)
    }
  }, [inputValue, onValidationChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
  }

  const handleInputBlur = () => {
    if (!inputValue.trim()) return

    const minutes = parseTimeInput(inputValue)
    if (minutes !== null) {
      onChange?.(minutes)
      // Format the input value for better UX
      setInputValue(formatTimeDisplay(minutes))
    }
  }

  const handleSuggestionClick = (minutes: number) => {
    setInputValue(formatTimeDisplay(minutes))
    onChange?.(minutes)
  }

  const displayError = error || internalError

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Label htmlFor="time-input" className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onMouseEnter={() => setShowHelp(true)}
                onMouseLeave={() => setShowHelp(false)}
              >
                <HelpCircle className="w-3 h-3 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-2 text-xs">
                <p><strong>Supported formats:</strong></p>
                <ul className="space-y-1">
                  <li>• Hours: 2h, 1.5h</li>
                  <li>• Minutes: 90m, 15m</li>
                  <li>• Combined: 2h 30m</li>
                  <li>• Clock: 2:30 (2h 30m)</li>
                  <li>• Number: 2 (assumes hours)</li>
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="relative">
        <Input
          id="time-input"
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          disabled={disabled}
          className={`${displayError ? "border-destructive" : ""}`}
        />
        
        {showPreview && preview && !displayError && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Badge variant="secondary" className="text-xs">
              {preview.display}
              {preview.unit === 'hours' && preview.value !== Math.floor(preview.value) && (
                <span className="text-muted-foreground ml-1">
                  ({Math.round(preview.value * 60)}m)
                </span>
              )}
            </Badge>
          </div>
        )}
      </div>

      {displayError && (
        <p className="text-sm text-destructive">{displayError}</p>
      )}

      {showSuggestions && !disabled && (
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-muted-foreground mr-2">Quick select:</span>
          {TIME_SUGGESTIONS.map((suggestion) => (
            <Button
              key={suggestion.minutes}
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => handleSuggestionClick(suggestion.minutes)}
              title={suggestion.description}
            >
              {suggestion.display}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

export default TimeInput