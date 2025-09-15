// Time conversion utilities for project management system
// Convert between minutes and hours for better user experience

export interface TimeUnit {
  value: number;
  unit: 'minutes' | 'hours';
  display: string;
}

/**
 * Convert minutes to hours with proper decimal formatting
 * @param minutes Number of minutes
 * @returns Time object with hours value and display string
 */
export function minutesToHours(minutes: number): TimeUnit {
  if (!minutes || minutes === 0) {
    return { value: 0, unit: 'hours', display: '0h' };
  }
  
  const hours = minutes / 60;
  
  // If less than 1 hour, show in minutes
  if (hours < 1) {
    return { value: minutes, unit: 'minutes', display: `${minutes}m` };
  }
  
  // For whole hours, show without decimals
  if (hours % 1 === 0) {
    return { value: hours, unit: 'hours', display: `${hours}h` };
  }
  
  // For fractional hours, show 1 decimal place
  return { value: Math.round(hours * 10) / 10, unit: 'hours', display: `${(Math.round(hours * 10) / 10)}h` };
}

/**
 * Convert hours to minutes for database storage
 * @param hours Number of hours (can be decimal)
 * @returns Number of minutes
 */
export function hoursToMinutes(hours: number): number {
  if (!hours || hours === 0) return 0;
  return Math.round(hours * 60);
}

/**
 * Parse user input and convert to minutes for database storage
 * Supports formats: "2h", "90m", "1.5h", "2h 30m", "2:30"
 * @param input User input string
 * @returns Number of minutes, or null if invalid
 */
export function parseTimeInput(input: string): number | null {
  if (!input || typeof input !== 'string') return null;
  
  const trimmed = input.trim().toLowerCase();
  
  // Handle "2h 30m" format
  const hourMinuteMatch = trimmed.match(/^(\d+(?:\.\d+)?)h?\s*(\d+)m?$/);
  if (hourMinuteMatch) {
    const hours = parseFloat(hourMinuteMatch[1]);
    const minutes = parseInt(hourMinuteMatch[2]);
    return hoursToMinutes(hours) + minutes;
  }
  
  // Handle "2:30" format (hours:minutes)
  const colonMatch = trimmed.match(/^(\d+):([0-5]?\d)$/);
  if (colonMatch) {
    const hours = parseInt(colonMatch[1]);
    const minutes = parseInt(colonMatch[2]);
    return hoursToMinutes(hours) + minutes;
  }
  
  // Handle "2h" format
  const hoursMatch = trimmed.match(/^(\d+(?:\.\d+)?)h?$/);
  if (hoursMatch) {
    const hours = parseFloat(hoursMatch[1]);
    return hoursToMinutes(hours);
  }
  
  // Handle "90m" format
  const minutesMatch = trimmed.match(/^(\d+)m$/);
  if (minutesMatch) {
    return parseInt(minutesMatch[1]);
  }
  
  // Handle plain number (assume hours)
  const numberMatch = trimmed.match(/^(\d+(?:\.\d+)?)$/);
  if (numberMatch) {
    const hours = parseFloat(numberMatch[1]);
    return hoursToMinutes(hours);
  }
  
  return null;
}

/**
 * Format minutes for user display with intelligent unit selection
 * @param minutes Number of minutes
 * @param forceUnit Optional unit to force display in
 * @returns Formatted time string
 */
export function formatTimeDisplay(minutes: number, forceUnit?: 'minutes' | 'hours'): string {
  if (!minutes || minutes === 0) return '0h';
  
  if (forceUnit === 'minutes') {
    return `${minutes}m`;
  }
  
  if (forceUnit === 'hours') {
    const hours = minutes / 60;
    return `${(Math.round(hours * 10) / 10)}h`;
  }
  
  // Auto-select best unit
  const timeUnit = minutesToHours(minutes);
  return timeUnit.display;
}

/**
 * Calculate total time from array of time values in minutes
 * @param times Array of time values in minutes
 * @returns TimeUnit object with total time
 */
export function calculateTotalTime(times: number[]): TimeUnit {
  const totalMinutes = times.reduce((sum, time) => sum + (time || 0), 0);
  return minutesToHours(totalMinutes);
}

/**
 * Get time difference between estimated and actual time
 * @param estimated Estimated time in minutes
 * @param actual Actual time in minutes
 * @returns Object with difference, percentage, and status
 */
export function getTimeDifference(estimated: number, actual: number) {
  if (!estimated || !actual) {
    return { difference: 0, percentage: 0, status: 'unknown' };
  }
  
  const difference = actual - estimated;
  const percentage = Math.round(((actual - estimated) / estimated) * 100);
  
  let status: 'under' | 'over' | 'ontime';
  if (Math.abs(percentage) <= 5) {
    status = 'ontime';
  } else if (percentage > 0) {
    status = 'over';
  } else {
    status = 'under';
  }
  
  return {
    difference,
    percentage,
    status,
    displayDifference: formatTimeDisplay(Math.abs(difference)),
    displayPercentage: `${Math.abs(percentage)}%`
  };
}

/**
 * Validate time input and return error message if invalid
 * @param input User input string
 * @returns Error message or null if valid
 */
export function validateTimeInput(input: string): string | null {
  if (!input || input.trim() === '') {
    return 'Time is required';
  }
  
  const parsed = parseTimeInput(input);
  if (parsed === null) {
    return 'Invalid time format. Use formats like: 2h, 90m, 1.5h, 2h 30m, or 2:30';
  }
  
  if (parsed < 0) {
    return 'Time cannot be negative';
  }
  
  if (parsed > 24 * 60) { // More than 24 hours
    return 'Time cannot exceed 24 hours';
  }
  
  return null;
}

// Export default object for easier importing
export default {
  minutesToHours,
  hoursToMinutes,
  parseTimeInput,
  formatTimeDisplay,
  calculateTotalTime,
  getTimeDifference,
  validateTimeInput
};