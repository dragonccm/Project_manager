'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Palette, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info,
  Sparkles,
  Heart,
  Star
} from 'lucide-react'

export function DesignSystemShowcase() {
  return (
    <div className="space-y-8 p-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Design System Showcase
        </h1>
        <p className="text-muted-foreground">
          A comprehensive overview of the unified design system with light/dark theme support
        </p>
      </div>

      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="components">
            <Sparkles className="h-4 w-4 mr-2" />
            Components
          </TabsTrigger>
          <TabsTrigger value="effects">
            <Zap className="h-4 w-4 mr-2" />
            Effects
          </TabsTrigger>
          <TabsTrigger value="typography">
            Typography
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
              <CardDescription>Semantic colors for consistent theming</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-semibold shadow-lg">
                  Primary
                </div>
                <p className="text-xs text-muted-foreground">Main actions & links</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-secondary flex items-center justify-center text-secondary-foreground font-semibold shadow-lg">
                  Secondary
                </div>
                <p className="text-xs text-muted-foreground">Alternative actions</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-accent flex items-center justify-center text-accent-foreground font-semibold shadow-lg">
                  Accent
                </div>
                <p className="text-xs text-muted-foreground">Highlights & focus</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-success flex items-center justify-center text-success-foreground font-semibold shadow-lg">
                  Success
                </div>
                <p className="text-xs text-muted-foreground">Positive actions</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-warning flex items-center justify-center text-warning-foreground font-semibold shadow-lg">
                  Warning
                </div>
                <p className="text-xs text-muted-foreground">Caution states</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-destructive flex items-center justify-center text-destructive-foreground font-semibold shadow-lg">
                  Destructive
                </div>
                <p className="text-xs text-muted-foreground">Errors & delete</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-info flex items-center justify-center text-info-foreground font-semibold shadow-lg">
                  Info
                </div>
                <p className="text-xs text-muted-foreground">Information</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-semibold shadow-lg">
                  Muted
                </div>
                <p className="text-xs text-muted-foreground">Subtle elements</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>Various button styles and variants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="warning">Warning</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="info">Info</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>Status indicators and labels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="destructive">Error</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed
                  </Badge>
                  <Badge variant="warning" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Pending
                  </Badge>
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Failed
                  </Badge>
                  <Badge variant="info" className="gap-1">
                    <Info className="h-3 w-3" />
                    Info
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>Form Elements</CardTitle>
                <CardDescription>Inputs with modern styling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Input</Label>
                  <Input placeholder="Enter your text..." />
                </div>
                <div className="space-y-2">
                  <Label>Email Input</Label>
                  <Input type="email" placeholder="email@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Disabled Input</Label>
                  <Input disabled placeholder="Disabled input" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>Icon Cards</CardTitle>
                <CardDescription>Cards with themed icons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Primary</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-gradient-to-br from-success/5 to-transparent">
                    <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                    <span className="text-sm font-medium">Success</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-gradient-to-br from-warning/5 to-transparent">
                    <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-warning" />
                    </div>
                    <span className="text-sm font-medium">Warning</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-gradient-to-br from-destructive/5 to-transparent">
                    <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <XCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <span className="text-sm font-medium">Error</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Effects Tab */}
        <TabsContent value="effects" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>Hover Lift</CardTitle>
                <CardDescription>Card with lift effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Hover over this card to see the lift effect
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft-lg">
              <CardHeader>
                <CardTitle>Soft Shadow</CardTitle>
                <CardDescription>Soft large shadow</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Persistent soft shadow effect
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Glass Effect</CardTitle>
                <CardDescription>Glassmorphism style</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Frosted glass appearance
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Gradient Background</CardTitle>
                <CardDescription>Primary to accent gradient</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Subtle gradient background
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Fade In</CardTitle>
                <CardDescription>Entrance animation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Smooth fade-in effect
                </p>
              </CardContent>
            </Card>

            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle>Scale In</CardTitle>
                <CardDescription>Scale animation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Scale-in entrance effect
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle>Typography Scale</CardTitle>
              <CardDescription>Consistent text sizing across the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold">Heading 1 - 4xl</h1>
                <h2 className="text-3xl font-bold">Heading 2 - 3xl</h2>
                <h3 className="text-2xl font-semibold">Heading 3 - 2xl</h3>
                <h4 className="text-xl font-semibold">Heading 4 - xl</h4>
                <h5 className="text-lg font-medium">Heading 5 - lg</h5>
                <h6 className="text-base font-medium">Heading 6 - base</h6>
              </div>
              
              <div className="space-y-2 pt-4 border-t">
                <p className="text-base">Body text - Base size (16px)</p>
                <p className="text-sm text-muted-foreground">Small text - 14px</p>
                <p className="text-xs text-muted-foreground">Extra small - 12px</p>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <p className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent text-3xl font-bold">
                  Gradient Text Effect
                </p>
                <p className="text-xl font-semibold text-primary">Colored Text - Primary</p>
                <p className="text-xl font-semibold text-success">Colored Text - Success</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DesignSystemShowcase
