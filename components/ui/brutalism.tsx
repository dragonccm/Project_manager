"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================
// BRUTALISM BUTTON
// ============================================

export interface BrutalismButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const BrutalismButton = React.forwardRef<HTMLButtonElement, BrutalismButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "w-full px-6 py-3 font-black text-base uppercase",
          "bg-[#ffeb3b] text-black",
          "border-4 border-black",
          "shadow-[6px_6px_0_#000]",
          "transition-all duration-200",
          "hover:shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px]",
          "active:shadow-[2px_2px_0_#000] active:translate-x-[4px] active:translate-y-[4px]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-[6px_6px_0_#000] disabled:translate-x-0 disabled:translate-y-0",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
BrutalismButton.displayName = "BrutalismButton"

// ============================================
// BRUTALISM INPUT
// ============================================

export interface BrutalismInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const BrutalismInput = React.forwardRef<HTMLInputElement, BrutalismInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-4 py-3 font-bold text-base",
          "bg-white text-black placeholder:text-gray-500 placeholder:uppercase",
          "border-4 border-black",
          "focus:outline-none focus:ring-0 focus:border-black",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-all duration-200",
          className
        )}
        {...props}
      />
    )
  }
)
BrutalismInput.displayName = "BrutalismInput"

// ============================================
// BRUTALISM LABEL
// ============================================

export interface BrutalismLabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {}

const BrutalismLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  BrutalismLabelProps
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "font-black text-sm uppercase text-black",
      "block mb-2",
      className
    )}
    {...props}
  />
))
BrutalismLabel.displayName = "BrutalismLabel"

// ============================================
// BRUTALISM CHECKBOX
// ============================================

export interface BrutalismCheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {}

const BrutalismCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  BrutalismCheckboxProps
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "h-6 w-6 shrink-0",
      "border-4 border-black bg-white",
      "focus:outline-none focus:ring-0",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-[#ffeb3b] data-[state=checked]:border-black",
      "transition-all duration-200",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      <Check className="h-5 w-5 stroke-[4px] text-black" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
BrutalismCheckbox.displayName = "BrutalismCheckbox"

// ============================================
// BRUTALISM CARD
// ============================================

export interface BrutalismCardProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const BrutalismCard = React.forwardRef<HTMLDivElement, BrutalismCardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-white",
        "border-5 border-black",
        "shadow-[10px_10px_0_#000]",
        className
      )}
      {...props}
    />
  )
)
BrutalismCard.displayName = "BrutalismCard"

const BrutalismCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-8 border-b-4 border-black", className)}
    {...props}
  />
))
BrutalismCardHeader.displayName = "BrutalismCardHeader"

const BrutalismCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-3xl font-black uppercase leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
BrutalismCardTitle.displayName = "BrutalismCardTitle"

const BrutalismCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-bold uppercase text-gray-600", className)}
    {...props}
  />
))
BrutalismCardDescription.displayName = "BrutalismCardDescription"

const BrutalismCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-8", className)} {...props} />
))
BrutalismCardContent.displayName = "BrutalismCardContent"

const BrutalismCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-8 pt-0", className)}
    {...props}
  />
))
BrutalismCardFooter.displayName = "BrutalismCardFooter"

// ============================================
// BRUTALISM SELECT
// ============================================

export interface BrutalismSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const BrutalismSelect = React.forwardRef<HTMLSelectElement, BrutalismSelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full px-4 py-3 font-bold text-base uppercase",
          "bg-white text-black",
          "border-4 border-black",
          "focus:outline-none focus:ring-0 focus:border-black",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-all duration-200",
          "appearance-none cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)
BrutalismSelect.displayName = "BrutalismSelect"

// ============================================
// BRUTALISM BADGE
// ============================================

export interface BrutalismBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

const BrutalismBadge = React.forwardRef<HTMLSpanElement, BrutalismBadgeProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-block px-3 py-1 font-black text-xs uppercase",
          "bg-[#ffeb3b] text-black",
          "border-2 border-black",
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)
BrutalismBadge.displayName = "BrutalismBadge"

// ============================================
// BRUTALISM TYPOGRAPHY
// ============================================

export interface BrutalismH1Props
  extends React.HTMLAttributes<HTMLHeadingElement> {}

const BrutalismH1 = React.forwardRef<HTMLHeadingElement, BrutalismH1Props>(
  ({ className, children, ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={cn(
          "text-4xl font-black uppercase leading-tight tracking-tight",
          "text-black",
          className
        )}
        {...props}
      >
        {children}
      </h1>
    )
  }
)
BrutalismH1.displayName = "BrutalismH1"

const BrutalismH2 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn(
          "text-3xl font-black uppercase leading-tight tracking-tight",
          "text-black",
          className
        )}
        {...props}
      >
        {children}
      </h2>
    )
  }
)
BrutalismH2.displayName = "BrutalismH2"

const BrutalismH3 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          "text-2xl font-black uppercase leading-tight tracking-tight",
          "text-black",
          className
        )}
        {...props}
      >
        {children}
      </h3>
    )
  }
)
BrutalismH3.displayName = "BrutalismH3"

// ============================================
// EXPORTS
// ============================================

export {
  BrutalismButton,
  BrutalismInput,
  BrutalismLabel,
  BrutalismCheckbox,
  BrutalismCard,
  BrutalismCardHeader,
  BrutalismCardTitle,
  BrutalismCardDescription,
  BrutalismCardContent,
  BrutalismCardFooter,
  BrutalismSelect,
  BrutalismBadge,
  BrutalismH1,
  BrutalismH2,
  BrutalismH3,
}
