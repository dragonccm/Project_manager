// Hook for managing links with MongoDB integration
import { useState, useEffect, useCallback } from 'react'

export interface EnhancedLink {
  id: string
  url: string
  originalUrl: string
  title: string
  description?: string
  platform: string
  metadata?: any
  tags: string[]
  category: string
  isBookmarked: boolean
  isFavorite: boolean
  accessCount: number
  lastAccessed?: string
  createdAt: string
  updatedAt: string
  projectId?: string
  userId?: string
  status: 'active' | 'broken' | 'archived'
  customTitle?: string
  notes?: string
}

// Platform definitions
export const PLATFORMS = {
  figma: {
    name: 'Figma',
    domain: 'figma.com',
    icon: '🎨',
    color: '#F24E1E',
    supportsPreview: true
  },
  github: {
    name: 'GitHub',
    domain: 'github.com',
    icon: '🐙',
    color: '#181717',
    supportsPreview: true
  },
  notion: {
    name: 'Notion',
    domain: 'notion.so',
    icon: '📝',
    color: '#000000',
    supportsPreview: true
  },
  drive: {
    name: 'Google Drive',
    domain: 'drive.google.com',
    icon: '💾',
    color: '#4285F4',
    supportsPreview: true
  },
  youtube: {
    name: 'YouTube',
    domain: 'youtube.com',
    icon: '📺',
    color: '#FF0000',
    supportsPreview: true
  },
  slack: {
    name: 'Slack',
    domain: 'slack.com',
    icon: '💬',
    color: '#4A154B',
    supportsPreview: false
  },
  trello: {
    name: 'Trello',
    domain: 'trello.com',
    icon: '📋',
    color: '#0079BF',
    supportsPreview: true
  },
  miro: {
    name: 'Miro',
    domain: 'miro.com',
    icon: '🖼️',
    color: '#FFD02F',
    supportsPreview: true
  },
  canva: {
    name: 'Canva',
    domain: 'canva.com',
    icon: '🎭',
    color: '#00C4CC',
    supportsPreview: true
  },
  generic: {
    name: 'Website',
    domain: '',
    icon: '🔗',
    color: '#6B7280',
    supportsPreview: true
  }
}

// Generate preview URL for supported platforms (standalone function)
export function generatePreviewUrl(link: EnhancedLink): string | null {
  const platform = PLATFORMS[link.platform as keyof typeof PLATFORMS]

  if (!platform?.supportsPreview) {
    return null
  }

  // For platforms with embed support
  if (link.metadata?.embedUrl) {
    return link.metadata.embedUrl
  }

  // Platform-specific preview generation
  switch (link.platform) {
    case 'figma':
      const figmaMatch = link.url.match(/figma\.com\/file\/([a-zA-Z0-9]+)/)
      if (figmaMatch) {
        return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(link.url)}`
      }
      break

    case 'youtube':
      const youtubeMatch = link.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
      if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`
      }
      break

    case 'drive':
      const driveMatch = link.url.match(/drive\.google\.com.*[\/=]([a-zA-Z0-9_-]+)/)
      if (driveMatch) {
        return `https://drive.google.com/file/d/${driveMatch[1]}/preview`
      }
      break
  }

  return null
}

export function useLinkManager() {
  const [links, setLinks] = useState<EnhancedLink[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load links from database on mount
  useEffect(() => {
    loadLinks()
  }, [])

  const loadLinks = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/links')
      const result = await response.json()

      if (result.success) {
        setLinks(result.data)
      } else {
        throw new Error(result.error || 'Failed to load links')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load links'
      setError(errorMessage)
      console.error('Error loading links:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addLink = useCallback(async (url: string, options: {
    category?: string
    tags?: string[]
    projectId?: string
    customTitle?: string
    notes?: string
  } = {}) => {
    setIsLoading(true)
    setError(null)

    try {
      // Detect platform
      const platformKey = Object.keys(PLATFORMS).find(key =>
        url.includes(PLATFORMS[key as keyof typeof PLATFORMS].domain)
      ) || 'generic'

      const linkData = {
        url,
        originalUrl: url,
        title: options.customTitle || url,
        platform: platformKey,
        tags: options.tags || [],
        category: options.category || 'uncategorized',
        isBookmarked: false,
        isFavorite: false,
        accessCount: 0,
        status: 'active' as const,
        customTitle: options.customTitle,
        notes: options.notes,
        projectId: options.projectId
      }

      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(linkData),
      })

      const result = await response.json()

      if (result.success) {
        setLinks(prev => [...prev, result.data])
        return result.data
      } else {
        throw new Error(result.error || 'Failed to create link')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create link'
      setError(errorMessage)
      console.error('Error creating link:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateLink = useCallback(async (id: string, updates: Partial<EnhancedLink>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/links', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      })

      const result = await response.json()

      if (result.success) {
        setLinks(prev => prev.map(link =>
          link.id === id ? { ...link, ...updates, updatedAt: new Date().toISOString() } : link
        ))
        return result.data
      } else {
        throw new Error(result.error || 'Failed to update link')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update link'
      setError(errorMessage)
      console.error('Error updating link:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeLink = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/links', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      const result = await response.json()

      if (result.success) {
        setLinks(prev => prev.filter(link => link.id !== id))
        return true
      } else {
        throw new Error(result.error || 'Failed to delete link')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete link'
      setError(errorMessage)
      console.error('Error deleting link:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const bulkAddLinks = useCallback(async (urls: string[]) => {
    setIsLoading(true)
    setError(null)

    const results = {
      successful: [] as EnhancedLink[],
      failed: [] as Array<{ url: string; error: string }>,
      progress: 0
    }

    try {
      const linksData = urls.map(url => {
        const platformKey = Object.keys(PLATFORMS).find(key =>
          url.includes(PLATFORMS[key as keyof typeof PLATFORMS].domain)
        ) || 'generic'

        return {
          url,
          originalUrl: url,
          title: url,
          platform: platformKey,
          tags: [],
          category: 'uncategorized',
          isBookmarked: false,
          isFavorite: false,
          accessCount: 0,
          status: 'active' as const
        }
      })

      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bulk: true, links: linksData }),
      })

      const result = await response.json()

      if (result.success) {
        results.successful = result.data
        setLinks(prev => [...prev, ...result.data])
      } else {
        // If bulk operation fails, mark all as failed
        results.failed = urls.map(url => ({
          url,
          error: result.error || 'Failed to create link'
        }))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to bulk create links'
      setError(errorMessage)
      console.error('Error bulk creating links:', err)
      // Mark all as failed
      results.failed = urls.map(url => ({
        url,
        error: errorMessage
      }))
    } finally {
      setIsLoading(false)
    }

    return results
  }, [])

  const toggleBookmark = useCallback(async (id: string) => {
    const link = links.find(l => l.id === id)
    if (link) {
      await updateLink(id, { isBookmarked: !link.isBookmarked })
    }
  }, [links, updateLink])

  const toggleFavorite = useCallback(async (id: string) => {
    const link = links.find(l => l.id === id)
    if (link) {
      await updateLink(id, { isFavorite: !link.isFavorite })
    }
  }, [links, updateLink])

  const incrementAccessCount = useCallback(async (id: string) => {
    const link = links.find(l => l.id === id)
    if (link) {
      await updateLink(id, {
        accessCount: link.accessCount + 1,
        lastAccessed: new Date().toISOString()
      })
    }
  }, [links, updateLink])

  // Search links with filters
  const searchLinks = useCallback((query: string, filters?: any) => {
    let filteredLinks = [...links]

    // Apply filters
    if (filters) {
      if (filters.platform) {
        filteredLinks = filteredLinks.filter(link => link.platform === filters.platform)
      }
      if (filters.category) {
        filteredLinks = filteredLinks.filter(link => link.category === filters.category)
      }
      if (filters.tags?.length) {
        filteredLinks = filteredLinks.filter(link =>
          filters.tags.some((tag: string) => link.tags.includes(tag))
        )
      }
      if (filters.status) {
        filteredLinks = filteredLinks.filter(link => link.status === filters.status)
      }
    }

    // Apply text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      filteredLinks = filteredLinks.filter(link =>
        link.title.toLowerCase().includes(searchTerm) ||
        link.description?.toLowerCase().includes(searchTerm) ||
        link.url.toLowerCase().includes(searchTerm) ||
        link.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    return filteredLinks
  }, [links])

  // Group links by criteria
  const groupLinks = useCallback((groupBy: 'platform' | 'category' | 'date' | 'project') => {
    const groups: Record<string, EnhancedLink[]> = {}

    links.forEach(link => {
      let groupKey: string

      switch (groupBy) {
        case 'platform':
          groupKey = PLATFORMS[link.platform as keyof typeof PLATFORMS]?.name || 'Unknown'
          break
        case 'category':
          groupKey = link.category || 'Uncategorized'
          break
        case 'date':
          groupKey = new Date(link.createdAt).toDateString()
          break
        case 'project':
          groupKey = link.projectId || 'No Project'
          break
        default:
          groupKey = 'All'
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(link)
    })

    return groups
  }, [links])

  // Export links to various formats
  const exportLinksData = useCallback((format: 'json' | 'csv' | 'html') => {
    switch (format) {
      case 'json':
        return JSON.stringify(links, null, 2)

      case 'csv':
        const headers = ['Title', 'URL', 'Platform', 'Category', 'Tags', 'Created', 'Status']
        const csvRows = [
          headers.join(','),
          ...links.map(link => [
            `"${link.title.replace(/"/g, '""')}"`,
            `"${link.url}"`,
            `"${link.platform}"`,
            `"${link.category}"`,
            `"${link.tags.join(', ')}"`,
            `"${new Date(link.createdAt).toLocaleDateString('vi-VN')}"`,
            `"${link.status}"`
          ].join(','))
        ]
        return csvRows.join('\n')

      case 'html':
        const htmlLinks = links.map(link => `
          <div class="link-item">
            <h3><a href="${link.url}" target="_blank">${link.title}</a></h3>
            <p>${link.description || ''}</p>
            <div class="meta">
              <span class="platform">${PLATFORMS[link.platform as keyof typeof PLATFORMS]?.name}</span>
              <span class="category">${link.category}</span>
              <span class="date">${new Date(link.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        `).join('')

        return `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Exported Links</title>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              .link-item { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
              .link-item h3 { margin-top: 0; }
              .meta { color: #666; font-size: 0.9em; }
              .meta span { margin-right: 15px; }
            </style>
          </head>
          <body>
            <h1>Exported Links</h1>
            ${htmlLinks}
          </body>
          </html>
        `

      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }, [links])

  // Refresh link status
  const refreshLinkStatus = useCallback(async (id: string) => {
    const link = links.find(l => l.id === id)
    if (!link) return

    try {
      // Simulate status check
      await new Promise(resolve => setTimeout(resolve, 500))
      const newStatus = Math.random() > 0.1 ? 'active' : 'broken'
      await updateLink(id, { status: newStatus })
    } catch (err) {
      console.error('Error refreshing link status:', err)
    }
  }, [links, updateLink])

  return {
    links,
    isLoading,
    error,
    loadLinks,
    addLink,
    updateLink,
    removeLink,
    bulkAddLinks,
    toggleBookmark,
    toggleFavorite,
    incrementAccessCount,
    searchLinks,
    groupLinks,
    exportLinks: exportLinksData,
    refreshLinkStatus,
  }
}