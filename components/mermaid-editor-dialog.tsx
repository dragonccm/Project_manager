'use client'

import React, { useState } from 'react'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Copy, Check, Code2, Eye } from 'lucide-react'

interface MermaidEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialCode?: string
  onSave: (code: string, theme: string) => void
}

const mermaidExamples = {
  flowchart: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,
  sequence: `sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
    Alice-)John: See you later!`,
  class: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    class Duck{
      +String beakColor
      +swim()
      +quack()
    }`,
  state: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`,
  er: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`,
  gantt: `gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2024-01-01, 30d
    Another task     :after a1  , 20d
    section Another
    Task in sec      :2024-01-12  , 12d
    another task     : 24d`
}

export default function MermaidEditorDialog({ 
  open, 
  onOpenChange, 
  initialCode = '', 
  onSave 
}: MermaidEditorDialogProps) {
  const { toast } = useToast()
  const [code, setCode] = useState(initialCode || mermaidExamples.flowchart)
  const [theme, setTheme] = useState('default')
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied!",
      description: "Code copied to clipboard"
    })
  }

  const handleLoadExample = (exampleKey: keyof typeof mermaidExamples) => {
    setCode(mermaidExamples[exampleKey])
  }

  const handleSave = () => {
    onSave(code, theme)
    onOpenChange(false)
    toast({
      title: "Saved!",
      description: "Mermaid diagram has been added to canvas"
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Mermaid Diagram Editor
          </DialogTitle>
          <DialogDescription>
            Create and edit Mermaid diagrams using code
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Theme Selector */}
          <div className="flex items-center gap-4">
            <Label>Theme:</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="forest">Forest</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="base">Base</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex-1" />
            
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
          </div>

          {/* Examples */}
          <div className="space-y-2">
            <Label>Load Example:</Label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(mermaidExamples).map((key) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => handleLoadExample(key as keyof typeof mermaidExamples)}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Editor/Preview Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'editor' | 'preview')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="editor">
                <Code2 className="w-4 h-4 mr-2" />
                Code Editor
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="w-4 h-4 mr-2" />
                Live Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-2">
              <Label>Mermaid Code:</Label>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your Mermaid diagram code here..."
                className="font-mono text-sm h-[400px] resize-none"
                spellCheck={false}
              />
              <p className="text-xs text-muted-foreground">
                Learn more about Mermaid syntax at{' '}
                <a 
                  href="https://mermaid.js.org/intro/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  mermaid.js.org
                </a>
              </p>
            </TabsContent>

            <TabsContent value="preview" className="space-y-2">
              <Card className="p-4 h-[400px] overflow-auto flex items-center justify-center bg-muted">
                <div className="text-center text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Preview will be rendered when the diagram is added to canvas</p>
                  <p className="text-xs mt-2">Mermaid rendering requires additional setup</p>
                </div>
              </Card>
              <p className="text-xs text-muted-foreground">
                Note: Live preview requires Mermaid.js library to be loaded
              </p>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Diagram
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
