import { useState, useCallback } from 'react'

// Base hook state interface
export interface BaseHookState<T> {
  data: T
  loading: boolean
  error: string | null
}

// Base hook return type
export interface BaseHookReturn<T> extends BaseHookState<T> {
  setData: (data: T) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

// Base hook factory
export function useBaseHook<T>(initialData: T): BaseHookReturn<T> {
  const [data, setData] = useState<T>(initialData)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setData(initialData)
    setLoading(false)
    setError(null)
  }, [initialData])

  return {
    data,
    loading,
    error,
    setData,
    setLoading,
    setError,
    reset,
  }
}

// Async operation hook
export interface AsyncOperationOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  onFinally?: () => void
}

export function useAsyncOperation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: AsyncOperationOptions
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await operation()
      options?.onSuccess?.(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      options?.onError?.(err instanceof Error ? err : new Error(errorMessage))
      return null
    } finally {
      setLoading(false)
      options?.onFinally?.()
    }
  }, [])

  return {
    loading,
    error,
    execute,
  }
}

// Debounced value hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  })

  return debouncedValue
}

// Local storage hook
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key])

  return [storedValue, setValue]
}

// Previous value hook
export function usePrevious<T>(value: T): T | undefined {
  const [previous, setPrevious] = useState<T>()

  useState(() => {
    setPrevious(value)
  })

  return previous
}
