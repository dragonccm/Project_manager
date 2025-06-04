"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { getMobileFormClasses, getMobileInputClasses, getMobileButtonClasses } from "@/lib/mobile-utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MobileFormProps {
  children: React.ReactNode
  className?: string
  onSubmit?: (e: React.FormEvent) => void
}

export function MobileForm({ children, className, onSubmit }: MobileFormProps) {
  const formClasses = getMobileFormClasses()
  
  return (
    <form 
      onSubmit={onSubmit}
      className={cn(formClasses.container, className)}
      noValidate
    >
      {children}
    </form>
  )
}

interface MobileFieldsetProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
}

export function MobileFieldset({ children, title, description, className }: MobileFieldsetProps) {
  const formClasses = getMobileFormClasses()
  
  return (
    <fieldset className={cn(formClasses.fieldset, className)}>
      {title && (
        <legend className="text-lg font-semibold text-foreground">
          {title}
        </legend>
      )}
      {description && (
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </fieldset>
  )
}

interface MobileFieldProps {
  label: string
  id: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function MobileField({ 
  label, 
  id, 
  error, 
  hint, 
  required, 
  children, 
  className 
}: MobileFieldProps) {
  const formClasses = getMobileFormClasses()
  
  return (
    <div className={cn(formClasses.field, className)}>
      <Label 
        htmlFor={id} 
        className={cn(
          formClasses.label,
          required && "after:content-['*'] after:text-destructive after:ml-1"
        )}
      >
        {label}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <MobileField 
        label={label} 
        id={inputId} 
        error={error} 
        hint={hint}
        required={props.required}
      >
        <Input
          ref={ref}
          id={inputId}
          className={cn(getMobileInputClasses(), className)}
          {...props}
        />
      </MobileField>
    )
  }
)
MobileInput.displayName = "MobileInput"

interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
}

export const MobileTextarea = forwardRef<HTMLTextAreaElement, MobileTextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <MobileField 
        label={label} 
        id={textareaId} 
        error={error} 
        hint={hint}
        required={props.required}
      >
        <Textarea
          ref={ref}
          id={textareaId}
          className={cn(getMobileInputClasses(), "min-h-[100px]", className)}
          {...props}
        />
      </MobileField>
    )
  }
)
MobileTextarea.displayName = "MobileTextarea"

interface MobileSelectProps {
  label: string
  placeholder?: string
  options: Array<{ value: string; label: string }>
  value?: string
  onValueChange?: (value: string) => void
  error?: string
  hint?: string
  required?: boolean
  className?: string
}

export function MobileSelect({
  label,
  placeholder,
  options,
  value,
  onValueChange,
  error,
  hint,
  required,
  className
}: MobileSelectProps) {
  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <MobileField 
      label={label} 
      id={selectId} 
      error={error} 
      hint={hint}
      required={required}
      className={className}
    >
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger 
          id={selectId}
          className={getMobileInputClasses()}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </MobileField>
  )
}

interface MobileFormActionsProps {
  children: React.ReactNode
  className?: string
}

export function MobileFormActions({ children, className }: MobileFormActionsProps) {
  const formClasses = getMobileFormClasses()
  
  return (
    <div className={cn(formClasses.actions, className)}>
      {children}
    </div>
  )
}

interface MobileSubmitButtonProps {
  children: React.ReactNode
  loading?: boolean
  disabled?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function MobileSubmitButton({
  children,
  loading,
  disabled,
  variant = "default",
  size = "md",
  className
}: MobileSubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant={variant}
      disabled={disabled || loading}
      className={cn(getMobileButtonClasses(size), "w-full sm:w-auto", className)}
    >
      {loading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  )
}
