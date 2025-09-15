// Enhanced Link Management system with multi-platform support
import { useState, useEffect, useCallback } from 'react'

// Platform detection and metadata extraction
export interface LinkPlatform {
  name: string
  domain: string
  icon: string
  color: string
  supportsPreview: boolean
  apiEndpoint?: string
  extractMetadata: (url: string) => Promise<LinkMetadata | null>
}

export interface LinkMetadata {
  title: string
  description?: string
  image?: string
  favicon?: string
  siteName?: string
  type?: string
  author?: string
  publishedDate?: string
  tags?: string[]
  estimatedReadTime?: number
  language?: string
  embedUrl?: string
  thumbnail?: string
}

export interface EnhancedLink {
  id: string
  url: string
  originalUrl: string
  title: string
  description?: string
  platform: string
  metadata?: LinkMetadata
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

// Platform configurations
const PLATFORMS: Record<string, LinkPlatform> = {
  figma: {
    name: 'Figma',
    domain: 'figma.com',
    icon: '🎨',
    color: '#F24E1E',
    supportsPreview: true,
    extractMetadata: async (url: string) => {
      try {
        // Extract Figma file ID from URL
        const match = url.match(/figma\.com\/file\/([a-zA-Z0-9]+)/);
        if (!match) return null;

        // In production, use Figma API
        return {
          title: 'Figma Design File',
          description: 'Design file from Figma',
          siteName: 'Figma',
          type: 'design',
          favicon: 'https://static.figma.com/app/icon/1/favicon.png'
        };
      } catch (error) {
        console.error('Error extracting Figma metadata:', error);
        return null;
      }
    }
  },
  
  github: {
    name: 'GitHub',
    domain: 'github.com',
    icon: '📁',
    color: '#24292e',
    supportsPreview: true,
    extractMetadata: async (url: string) => {
      try {
        const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) return null;

        const [, owner, repo] = match;
        
        // In production, use GitHub API
        return {
          title: `${owner}/${repo}`,
          description: `GitHub repository by ${owner}`,
          siteName: 'GitHub',
          type: 'repository',
          author: owner,
          favicon: 'https://github.com/favicon.ico'
        };
      } catch (error) {
        console.error('Error extracting GitHub metadata:', error);
        return null;
      }
    }
  },

  notion: {
    name: 'Notion',
    domain: 'notion.so',
    icon: '📝',
    color: '#000000',
    supportsPreview: true,
    extractMetadata: async (url: string) => {
      try {
        // Notion URLs are complex, basic extraction
        return {
          title: 'Notion Page',
          description: 'Document from Notion workspace',
          siteName: 'Notion',
          type: 'document',
          favicon: 'https://www.notion.so/images/favicon.ico'
        };
      } catch (error) {
        console.error('Error extracting Notion metadata:', error);
        return null;
      }
    }
  },

  drive: {
    name: 'Google Drive',
    domain: 'drive.google.com',
    icon: '💾',
    color: '#4285F4',
    supportsPreview: true,
    extractMetadata: async (url: string) => {
      try {
        const match = url.match(/drive\.google\.com.*[\/=]([a-zA-Z0-9_-]+)/);
        if (!match) return null;

        return {
          title: 'Google Drive File',
          description: 'File stored in Google Drive',
          siteName: 'Google Drive',
          type: 'file',
          favicon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png'
        };
      } catch (error) {
        console.error('Error extracting Google Drive metadata:', error);
        return null;
      }
    }
  },

  youtube: {
    name: 'YouTube',
    domain: 'youtube.com',
    icon: '📺',
    color: '#FF0000',
    supportsPreview: true,
    extractMetadata: async (url: string) => {
      try {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (!match) return null;

        const videoId = match[1];
        
        // In production, use YouTube API
        return {
          title: 'YouTube Video',
          description: 'Video from YouTube',
          siteName: 'YouTube',
          type: 'video',
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          favicon: 'https://www.youtube.com/favicon.ico'
        };
      } catch (error) {
        console.error('Error extracting YouTube metadata:', error);
        return null;
      }
    }
  },

  slack: {
    name: 'Slack',
    domain: 'slack.com',
    icon: '💬',
    color: '#4A154B',
    supportsPreview: false,
    extractMetadata: async (url: string) => {
      try {
        const match = url.match(/([a-zA-Z0-9-]+)\.slack\.com/);
        if (!match) return null;

        const workspace = match[1];
        return {
          title: `${workspace} Slack Workspace`,
          description: 'Slack workspace or channel',
          siteName: 'Slack',
          type: 'chat',
          favicon: 'https://a.slack-edge.com/80588/img/icons/favicon-32.png'
        };
      } catch (error) {
        console.error('Error extracting Slack metadata:', error);
        return null;
      }
    }
  },

  trello: {
    name: 'Trello',
    domain: 'trello.com',
    icon: '📋',
    color: '#0079BF',
    supportsPreview: true,
    extractMetadata: async (url: string) => {
      try {
        const match = url.match(/trello\.com\/b\/([a-zA-Z0-9]+)/);
        if (!match) return null;

        return {
          title: 'Trello Board',
          description: 'Project board on Trello',
          siteName: 'Trello',
          type: 'kanban',
          favicon: 'https://trello.com/favicon.ico'
        };
      } catch (error) {
        console.error('Error extracting Trello metadata:', error);
        return null;
      }
    }
  },

  miro: {
    name: 'Miro',
    domain: 'miro.com',
    icon: '🖼️',
    color: '#FFD02F',
    supportsPreview: true,
    extractMetadata: async (url: string) => {
      try {
        const match = url.match(/miro\.com\/app\/board\/([a-zA-Z0-9_=-]+)/);
        if (!match) return null;

        return {
          title: 'Miro Board',
          description: 'Collaborative whiteboard on Miro',
          siteName: 'Miro',
          type: 'whiteboard',
          favicon: 'https://miro.com/favicon.ico'
        };
      } catch (error) {
        console.error('Error extracting Miro metadata:', error);
        return null;
      }
    }
  },

  canva: {
    name: 'Canva',
    domain: 'canva.com',
    icon: '🎭',
    color: '#00C4CC',
    supportsPreview: true,
    extractMetadata: async (url: string) => {
      try {
        const match = url.match(/canva\.com\/design\/([a-zA-Z0-9_-]+)/);
        if (!match) return null;

        return {
          title: 'Canva Design',
          description: 'Design project on Canva',
          siteName: 'Canva',
          type: 'design',
          favicon: 'https://static.canva.com/web/images/favicon.ico'
        };
      } catch (error) {
        console.error('Error extracting Canva metadata:', error);
        return null;
      }
    }
  },

  generic: {
    name: 'Website',
    domain: '',
    icon: '🔗',
    color: '#6B7280',
    supportsPreview: true,
    extractMetadata: async (url: string) => {
      try {
        // For generic websites, we would use a service like:
        // - Open Graph metadata extraction
        // - HTML meta tags parsing
        // - Screenshot service
        
        const domain = new URL(url).hostname;
        return {
          title: domain,
          description: `Link to ${domain}`,
          siteName: domain,
          type: 'website',
          favicon: `https://www.google.com/s2/favicons?domain=${domain}`
        };
      } catch (error) {
        console.error('Error extracting generic metadata:', error);
        return null;
      }
    }
  }
};

/**
 * Detect platform from URL
 */
export function detectPlatform(url: string): LinkPlatform {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Check each platform
    for (const [key, platform] of Object.entries(PLATFORMS)) {
      if (key !== 'generic' && hostname.includes(platform.domain)) {
        return platform;
      }
    }

    return PLATFORMS.generic;
  } catch (error) {
    console.error('Error detecting platform:', error);
    return PLATFORMS.generic;
  }
}

/**
 * Extract metadata from URL
 */
export async function extractLinkMetadata(url: string): Promise<LinkMetadata | null> {
  const platform = detectPlatform(url);
  
  try {
    return await platform.extractMetadata(url);
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return null;
  }
}

/**
 * Validate URL format
 */
export function validateURL(url: string): { valid: boolean; error?: string } {
  try {
    new URL(url);
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: 'URL format không hợp lệ' 
    };
  }
}

/**
 * Check if URL is accessible
 */
export async function checkLinkStatus(url: string): Promise<{
  status: 'active' | 'broken' | 'redirect' | 'timeout';
  statusCode?: number;
  redirectUrl?: string;
  error?: string;
}> {
  try {
    // In a real app, this would make a HEAD request
    // For demo, we'll simulate the check
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate different responses
    const random = Math.random();
    if (random < 0.9) {
      return { status: 'active', statusCode: 200 };
    } else if (random < 0.95) {
      return { 
        status: 'redirect', 
        statusCode: 301, 
        redirectUrl: url + '/redirected' 
      };
    } else {
      return { 
        status: 'broken', 
        statusCode: 404, 
        error: 'Page not found' 
      };
    }
  } catch (error) {
    return { 
      status: 'timeout', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Generate preview URL for supported platforms
 */
export function generatePreviewUrl(link: EnhancedLink): string | null {
  const platform = PLATFORMS[link.platform];
  
  if (!platform?.supportsPreview) {
    return null;
  }

  // For platforms with embed support
  if (link.metadata?.embedUrl) {
    return link.metadata.embedUrl;
  }

  // Platform-specific preview generation
  switch (link.platform) {
    case 'figma':
      const figmaMatch = link.url.match(/figma\.com\/file\/([a-zA-Z0-9]+)/);
      if (figmaMatch) {
        return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(link.url)}`;
      }
      break;
      
    case 'youtube':
      const youtubeMatch = link.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
      }
      break;
      
    case 'drive':
      const driveMatch = link.url.match(/drive\.google\.com.*[\/=]([a-zA-Z0-9_-]+)/);
      if (driveMatch) {
        return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
      }
      break;
  }

  return null;
}

/**
 * Create enhanced link with metadata
 */
export async function createEnhancedLink(
  url: string, 
  options: {
    category?: string;
    tags?: string[];
    projectId?: string;
    customTitle?: string;
    notes?: string;
  } = {}
): Promise<EnhancedLink> {
  const validation = validateURL(url);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const platform = detectPlatform(url);
  const metadata = await extractLinkMetadata(url);
  const status = await checkLinkStatus(url);

  const enhancedLink: EnhancedLink = {
    id: Date.now().toString(),
    url,
    originalUrl: url,
    title: options.customTitle || metadata?.title || new URL(url).hostname,
    description: metadata?.description,
    platform: Object.keys(PLATFORMS).find(key => PLATFORMS[key] === platform) || 'generic',
    metadata: metadata || undefined,
    tags: options.tags || [],
    category: options.category || 'uncategorized',
    isBookmarked: false,
    isFavorite: false,
    accessCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    projectId: options.projectId,
    status: status.status === 'active' ? 'active' : 'broken',
    customTitle: options.customTitle,
    notes: options.notes
  };

  return enhancedLink;
}

/**
 * Bulk link validation and metadata extraction
 */
export async function processBulkLinks(urls: string[]): Promise<{
  successful: EnhancedLink[];
  failed: Array<{ url: string; error: string }>;
  progress: number;
}> {
  const results = {
    successful: [] as EnhancedLink[],
    failed: [] as Array<{ url: string; error: string }>,
    progress: 0
  };

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i].trim();
    
    try {
      const enhancedLink = await createEnhancedLink(url);
      results.successful.push(enhancedLink);
    } catch (error) {
      results.failed.push({
        url,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    results.progress = Math.round(((i + 1) / urls.length) * 100);
  }

  return results;
}

/**
 * Search links with fuzzy matching
 */
export function searchLinks(
  links: EnhancedLink[], 
  query: string,
  filters?: {
    platform?: string;
    category?: string;
    tags?: string[];
    status?: string;
    dateRange?: { start: Date; end: Date };
  }
): EnhancedLink[] {
  let filteredLinks = [...links];

  // Apply filters
  if (filters) {
    if (filters.platform) {
      filteredLinks = filteredLinks.filter(link => link.platform === filters.platform);
    }
    
    if (filters.category) {
      filteredLinks = filteredLinks.filter(link => link.category === filters.category);
    }
    
    if (filters.tags?.length) {
      filteredLinks = filteredLinks.filter(link => 
        filters.tags!.some(tag => link.tags.includes(tag))
      );
    }
    
    if (filters.status) {
      filteredLinks = filteredLinks.filter(link => link.status === filters.status);
    }
    
    if (filters.dateRange) {
      const start = filters.dateRange.start.getTime();
      const end = filters.dateRange.end.getTime();
      filteredLinks = filteredLinks.filter(link => {
        const created = new Date(link.createdAt).getTime();
        return created >= start && created <= end;
      });
    }
  }

  // Apply text search
  if (query.trim()) {
    const searchTerm = query.toLowerCase();
    filteredLinks = filteredLinks.filter(link => 
      link.title.toLowerCase().includes(searchTerm) ||
      link.description?.toLowerCase().includes(searchTerm) ||
      link.url.toLowerCase().includes(searchTerm) ||
      link.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      link.notes?.toLowerCase().includes(searchTerm)
    );
  }

  return filteredLinks;
}

/**
 * Group links by various criteria
 */
export function groupLinks(links: EnhancedLink[], groupBy: 'platform' | 'category' | 'date' | 'project'): Record<string, EnhancedLink[]> {
  const groups: Record<string, EnhancedLink[]> = {};

  links.forEach(link => {
    let groupKey: string;

    switch (groupBy) {
      case 'platform':
        groupKey = PLATFORMS[link.platform]?.name || 'Unknown';
        break;
      case 'category':
        groupKey = link.category || 'Uncategorized';
        break;
      case 'date':
        groupKey = new Date(link.createdAt).toDateString();
        break;
      case 'project':
        groupKey = link.projectId || 'No Project';
        break;
      default:
        groupKey = 'All';
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(link);
  });

  return groups;
}

/**
 * Export links to various formats
 */
export function exportLinks(links: EnhancedLink[], format: 'json' | 'csv' | 'html'): string {
  switch (format) {
    case 'json':
      return JSON.stringify(links, null, 2);
      
    case 'csv':
      const headers = ['Title', 'URL', 'Platform', 'Category', 'Tags', 'Created', 'Status'];
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
      ];
      return csvRows.join('\n');
      
    case 'html':
      const htmlLinks = links.map(link => `
        <div class="link-item">
          <h3><a href="${link.url}" target="_blank">${link.title}</a></h3>
          <p>${link.description || ''}</p>
          <div class="meta">
            <span class="platform">${PLATFORMS[link.platform]?.name}</span>
            <span class="category">${link.category}</span>
            <span class="date">${new Date(link.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      `).join('');
      
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
      `;
      
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

// Enhanced React hook for managing links with MongoDB integration
export function useLinkManager() {
  const [links, setLinks] = useState<EnhancedLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load links from database on mount
  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/links');
      const result = await response.json();
      
      if (result.success) {
        setLinks(result.data);
      } else {
        throw new Error(result.error || 'Failed to load links');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load links';
      setError(errorMessage);
      console.error('Error loading links:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addLink = useCallback(async (url: string, options?: Parameters<typeof createEnhancedLink>[1]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create enhanced link with metadata
      const enhancedLinkData = await createEnhancedLink(url, options);
      
      // Save to database
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enhancedLinkData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLinks(prev => [result.data, ...prev]);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to add link');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add link';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateLink = useCallback(async (id: string, updates: Partial<EnhancedLink>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/links', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLinks(prev => prev.map(link => 
          link.id === id ? result.data : link
        ));
      } else {
        throw new Error(result.error || 'Failed to update link');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update link';
      setError(errorMessage);
      console.error('Error updating link:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeLink = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/links?id=${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLinks(prev => prev.filter(link => link.id !== id));
      } else {
        throw new Error(result.error || 'Failed to delete link');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete link';
      setError(errorMessage);
      console.error('Error deleting link:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bulkAddLinks = useCallback(async (urls: string[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Process URLs to create enhanced link data
      const results = await processBulkLinks(urls);
      
      // Save successful links to database
      if (results.successful.length > 0) {
        const response = await fetch('/api/links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            bulk: true, 
            links: results.successful 
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          setLinks(prev => [...result.data, ...prev]);
        } else {
          throw new Error(result.error || 'Failed to bulk import links');
        }
      }
      
      if (results.failed.length > 0) {
        setError(`${results.failed.length} links failed to process`);
      }
      
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bulk import failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshLinkStatus = useCallback(async (id: string) => {
    const link = links.find(l => l.id === id);
    if (!link) return;

    const status = await checkLinkStatus(link.url);
    const linkStatus = status.status === 'active' ? 'active' : 
                     status.status === 'broken' ? 'broken' : 
                     status.status === 'timeout' ? 'broken' : 'active';
    
    await updateLink(id, { status: linkStatus });
  }, [links, updateLink]);

  return {
    links,
    isLoading,
    error,
    addLink,
    updateLink,
    removeLink,
    bulkAddLinks,
    refreshLinkStatus,
    loadLinks,
    searchLinks: (query: string, filters?: Parameters<typeof searchLinks>[2]) => 
      searchLinks(links, query, filters),
    groupLinks: (groupBy: Parameters<typeof groupLinks>[1]) => 
      groupLinks(links, groupBy),
    exportLinks: (format: Parameters<typeof exportLinks>[1]) => 
      exportLinks(links, format)
  };
}

export { PLATFORMS };