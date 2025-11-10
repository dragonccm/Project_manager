"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================
// NEUMORPHISM DESIGN TOKENS
// ============================================

export const neumorphismTokens = {
  colors: {
    background: "#fff",
    surface: "#fff",
    text: "#000",
    textSecondary: "#666",
    primary: "#000",
    primaryLight: "#333",
    primaryDark: "#000",
    success: "#4caf50",
    error: "#f44336",
    warning: "#ff9800",
  },
  shadows: {
    raised: `0 0.706592px 0.706592px -0.666667px #00000014,
             0 1.80656px 1.80656px -1.33333px #00000014,
             0 3.62176px 3.62176px -2px #00000012,
             0 6.8656px 6.8656px -2.66667px #00000012,
             0 13.6468px 13.6468px -3.33333px #0000000d,
             0 30px 30px -4px #00000005,
             inset 0 3px 1px #fff`,
    raisedHover: `0 0.706592px 0.706592px -0.666667px #00000014,
                  0 1.80656px 1.80656px -1.33333px #00000014,
                  0 3.62176px 3.62176px -2px #00000012,
                  0 6.8656px 6.8656px -2.66667px #00000012,
                  0 13.6468px 13.6468px -3.33333px #0000000d,
                  0 30px 30px -4px #00000005,
                  inset 0 3px 1px #fff`,
    raisedSmall: `0 0.706592px 0.706592px -0.666667px #00000014,
                  0 1.80656px 1.80656px -1.33333px #00000014,
                  0 3.62176px 3.62176px -2px #00000012,
                  inset 0 3px 1px #fff`,
    inset: `inset 0 2px 4px rgba(0, 0, 0, 0.1),
            inset 0 -1px 2px rgba(255, 255, 255, 0.8)`,
  },
  borderRadius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    full: "9999px",
  },
}

// ============================================
// NEUMORPHISM BUTTON
// ============================================

export interface NeumorphismButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
}

const NeumorphismButton = React.forwardRef<HTMLButtonElement, NeumorphismButtonProps>(
  ({ className, children, variant = "primary", size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    }

    const variantClasses = {
      primary: "bg-black text-white",
      secondary: "bg-white text-black",
      ghost: "bg-transparent text-black",
    }

    const shadowStyles = {
      primary: {
        boxShadow: neumorphismTokens.shadows.raised,
      },
      secondary: {
        boxShadow: neumorphismTokens.shadows.raised,
      },
      ghost: {},
    }

    return (
      <button
        ref={ref}
        style={shadowStyles[variant]}
        className={cn(
          "font-semibold rounded-xl transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "hover:-translate-y-0.5",
          "active:scale-95",
          sizeClasses[size],
          variant === "ghost" && "hover:bg-gray-100",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
NeumorphismButton.displayName = "NeumorphismButton"

// ============================================
// NEUMORPHISM INPUT
// ============================================

export interface NeumorphismInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const NeumorphismInput = React.forwardRef<HTMLInputElement, NeumorphismInputProps>(
  ({ className, type, style, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        style={{
          boxShadow: neumorphismTokens.shadows.inset,
          ...style,
        }}
        className={cn(
          "w-full px-4 py-3 rounded-xl font-medium text-base",
          "bg-white text-black placeholder:text-gray-400",
          "border-none outline-none",
          "focus:ring-2 focus:ring-black focus:ring-opacity-20",
          "transition-all duration-300",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    )
  }
)
NeumorphismInput.displayName = "NeumorphismInput"

// ============================================
// NEUMORPHISM TEXTAREA
// ============================================

export interface NeumorphismTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const NeumorphismTextarea = React.forwardRef<HTMLTextAreaElement, NeumorphismTextareaProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        style={{
          boxShadow: neumorphismTokens.shadows.inset,
          ...style,
        }}
        className={cn(
          "w-full px-4 py-3 rounded-xl font-medium text-base",
          "bg-white text-black placeholder:text-gray-400",
          "border-none outline-none resize-none",
          "focus:ring-2 focus:ring-black focus:ring-opacity-20",
          "transition-all duration-300",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    )
  }
)
NeumorphismTextarea.displayName = "NeumorphismTextarea"

// ============================================
// NEUMORPHISM LABEL
// ============================================

export interface NeumorphismLabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {}

const NeumorphismLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  NeumorphismLabelProps
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "font-semibold text-sm text-black",
      "block mb-2",
      className
    )}
    {...props}
  />
))
NeumorphismLabel.displayName = "NeumorphismLabel"

// ============================================
// NEUMORPHISM CHECKBOX
// ============================================

export interface NeumorphismCheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {}

const NeumorphismCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  NeumorphismCheckboxProps
>(({ className, style, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    style={{
      boxShadow: neumorphismTokens.shadows.inset,
      ...style,
    }}
    className={cn(
      "h-6 w-6 shrink-0 rounded-lg",
      "bg-white",
      "focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-black",
      "transition-all duration-300",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      <Check className="h-4 w-4 text-white stroke-[3px]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
NeumorphismCheckbox.displayName = "NeumorphismCheckbox"

// ============================================
// NEUMORPHISM CARD
// ============================================

export interface NeumorphismCardProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const NeumorphismCard = React.forwardRef<HTMLDivElement, NeumorphismCardProps>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      style={{
        boxShadow: neumorphismTokens.shadows.raised,
        ...style,
      }}
      className={cn(
        "bg-white rounded-2xl",
        "transition-all duration-300",
        className
      )}
      {...props}
    />
  )
)
NeumorphismCard.displayName = "NeumorphismCard"

const NeumorphismCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6", className)}
    {...props}
  />
))
NeumorphismCardHeader.displayName = "NeumorphismCardHeader"

const NeumorphismCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-bold text-black leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
NeumorphismCardTitle.displayName = "NeumorphismCardTitle"

const NeumorphismCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-medium text-gray-600", className)}
    {...props}
  />
))
NeumorphismCardDescription.displayName = "NeumorphismCardDescription"

const NeumorphismCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
NeumorphismCardContent.displayName = "NeumorphismCardContent"

const NeumorphismCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
NeumorphismCardFooter.displayName = "NeumorphismCardFooter"

// ============================================
// NEUMORPHISM SELECT
// ============================================

export interface NeumorphismSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const NeumorphismSelect = React.forwardRef<HTMLSelectElement, NeumorphismSelectProps>(
  ({ className, children, style, ...props }, ref) => {
    return (
      <select
        ref={ref}
        style={{
          boxShadow: neumorphismTokens.shadows.inset,
          ...style,
        }}
        className={cn(
          "w-full px-4 py-3 rounded-xl font-medium text-base",
          "bg-white text-black",
          "border-none outline-none appearance-none cursor-pointer",
          "focus:ring-2 focus:ring-black focus:ring-opacity-20",
          "transition-all duration-300",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)
NeumorphismSelect.displayName = "NeumorphismSelect"

// ============================================
// NEUMORPHISM BADGE
// ============================================

export interface NeumorphismBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "error" | "warning"
}

const NeumorphismBadge = React.forwardRef<HTMLSpanElement, NeumorphismBadgeProps>(
  ({ className, children, variant = "default", style, ...props }, ref) => {
    const variantClasses = {
      default: "bg-white text-black",
      primary: "bg-black text-white",
      success: "bg-green-500 text-white",
      error: "bg-red-500 text-white",
      warning: "bg-orange-500 text-white",
    }

    return (
      <span
        ref={ref}
        style={{
          boxShadow: neumorphismTokens.shadows.raisedSmall,
          ...style,
        }}
        className={cn(
          "inline-block px-3 py-1 rounded-full font-semibold text-xs",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)
NeumorphismBadge.displayName = "NeumorphismBadge"

// ============================================
// NEUMORPHISM TYPOGRAPHY
// ============================================

export interface NeumorphismH1Props
  extends React.HTMLAttributes<HTMLHeadingElement> {}

const NeumorphismH1 = React.forwardRef<HTMLHeadingElement, NeumorphismH1Props>(
  ({ className, children, ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={cn(
          "text-4xl font-bold leading-tight tracking-tight",
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
NeumorphismH1.displayName = "NeumorphismH1"

const NeumorphismH2 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn(
          "text-3xl font-bold leading-tight tracking-tight",
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
NeumorphismH2.displayName = "NeumorphismH2"

const NeumorphismH3 = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          "text-2xl font-bold leading-tight tracking-tight",
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
NeumorphismH3.displayName = "NeumorphismH3"

// ============================================
// NEUMORPHISM DIVIDER
// ============================================

export interface NeumorphismDividerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const NeumorphismDivider = React.forwardRef<HTMLDivElement, NeumorphismDividerProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "h-px w-full my-4",
        "bg-gradient-to-r from-transparent via-gray-300 to-transparent",
        className
      )}
      {...props}
    />
  )
)
NeumorphismDivider.displayName = "NeumorphismDivider"

// ============================================
// NEUMORPHISM ICON BUTTON
// ============================================

export interface NeumorphismIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg"
}

const NeumorphismIconButton = React.forwardRef<HTMLButtonElement, NeumorphismIconButtonProps>(
  ({ className, children, size = "md", style, ...props }, ref) => {
    const sizeClasses = {
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-12 h-12",
    }

    return (
      <button
        ref={ref}
        style={{
          boxShadow: neumorphismTokens.shadows.raised,
          ...style,
        }}
        className={cn(
          "rounded-full flex items-center justify-center",
          "bg-white text-black",
          "hover:-translate-y-0.5",
          "active:scale-95",
          "transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
NeumorphismIconButton.displayName = "NeumorphismIconButton"

// ============================================
// EXPORTS
// ============================================

export {
  NeumorphismButton,
  NeumorphismInput,
  NeumorphismTextarea,
  NeumorphismLabel,
  NeumorphismCheckbox,
  NeumorphismCard,
  NeumorphismCardHeader,
  NeumorphismCardTitle,
  NeumorphismCardDescription,
  NeumorphismCardContent,
  NeumorphismCardFooter,
  NeumorphismSelect,
  NeumorphismBadge,
  NeumorphismH1,
  NeumorphismH2,
  NeumorphismH3,
  NeumorphismDivider,
  NeumorphismIconButton,
}
