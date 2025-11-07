'use client'

import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

interface MermaidRendererProps {
  code: string
  width?: number
  height?: number
  theme?: string
}

// Initialize mermaid
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Arial, sans-serif',
    fontSize: 14
  })
}

export default function MermaidRenderer({ 
  code, 
  width = 400, 
  height = 300,
  theme = 'default'
}: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string>('')
  const renderIdRef = useRef(0)

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current || !code) return
      
      try {
        setError('')
        // Generate unique ID for this render
        renderIdRef.current += 1
        const id = `mermaid-${Date.now()}-${renderIdRef.current}`
        
        // Update theme if needed
        mermaid.initialize({ 
          theme: theme as any,
          startOnLoad: false,
          securityLevel: 'loose'
        })
        
        // Render the diagram
        const { svg: renderedSvg } = await mermaid.render(id, code)
        setSvg(renderedSvg)
      } catch (err) {
        console.error('Mermaid render error:', err)
        setError(err instanceof Error ? err.message : 'Failed to render diagram')
      }
    }

    renderDiagram()
  }, [code, theme])

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-red-50 border-2 border-red-200 rounded-lg"
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <p className="text-red-600 font-semibold mb-2">⚠ Mermaid Error</p>
          <p className="text-xs text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!svg) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 border-2 border-gray-200 rounded-lg"
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Rendering diagram...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="mermaid-container overflow-auto bg-white rounded-lg border border-gray-200"
      style={{ 
        width, 
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
