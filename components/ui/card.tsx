import * as React from "react"

import { cn } from "@/lib/utils"
import { GlareHover } from "@/components/glare-hover"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glareEffect?: boolean
  glareColor?: string
  glareOpacity?: number
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glareEffect = false, glareColor, glareOpacity, children, ...props }, ref) => {
    const cardContent = (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )

    if (glareEffect) {
      return (
        <GlareHover
          glareColor={glareColor}
          glareOpacity={glareOpacity}
          glareAngle={-30}
          glareSize={300}
          transitionDuration={800}
        >
          {cardContent}
        </GlareHover>
      )
    }

    return cardContent
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
