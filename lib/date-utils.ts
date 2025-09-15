/**
 * Date utilities for the Project Manager application
 * Provides consistent date formatting and timezone handling
 */

/**
 * Get a date string in YYYY-MM-DD format using local timezone
 * @param date - Date object or date string
 * @returns Formatted date string
 */
export function getLocalDateString(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // Handle invalid dates
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to getLocalDateString:', date)
    return getTodayDateString()
  }
  
  // Get local date components
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Get today's date string in YYYY-MM-DD format
 * @returns Today's date string
 */
export function getTodayDateString(): string {
  return getLocalDateString(new Date())
}

/**
 * Format date for display (Vietnamese format)
 * @param date - Date object or date string
 * @returns Formatted date string for display
 */
export function formatDateForDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return 'Không xác định'
  }
  
  const day = dateObj.getDate()
  const month = dateObj.getMonth() + 1
  const year = dateObj.getFullYear()
  
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
}

/**
 * Get relative time string (e.g., "2 ngày trước", "1 tuần sau")
 * @param date - Date object or date string
 * @returns Relative time string in Vietnamese
 */
export function getRelativeTimeString(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = dateObj.getTime() - now.getTime()
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) {
    return 'Hôm nay'
  } else if (diffInDays === 1) {
    return 'Ngày mai'
  } else if (diffInDays === -1) {
    return 'Hôm qua'
  } else if (diffInDays > 0) {
    return `${diffInDays} ngày tới`
  } else {
    return `${Math.abs(diffInDays)} ngày trước`
  }
}

/**
 * Check if a date is today
 * @param date - Date object or date string
 * @returns True if the date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  
  return getLocalDateString(dateObj) === getLocalDateString(today)
}

/**
 * Check if a date is in the past
 * @param date - Date object or date string
 * @returns True if the date is in the past
 */
export function isPastDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  
  return dateObj < today
}

/**
 * Check if a date is in the future
 * @param date - Date object or date string
 * @returns True if the date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  
  return dateObj > today
}

/**
 * Add days to a date
 * @param date - Date object or date string
 * @param days - Number of days to add (can be negative)
 * @returns New date object
 */
export function addDays(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date)
  const result = new Date(dateObj)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Get start of day for a date
 * @param date - Date object or date string
 * @returns Date object at start of day
 */
export function getStartOfDay(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date)
  const result = new Date(dateObj)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Get end of day for a date
 * @param date - Date object or date string
 * @returns Date object at end of day
 */
export function getEndOfDay(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date)
  const result = new Date(dateObj)
  result.setHours(23, 59, 59, 999)
  return result
}
