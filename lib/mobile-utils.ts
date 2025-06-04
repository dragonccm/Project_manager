import { cn } from "@/lib/utils"

/**
 * Mobile-first responsive design utilities for the Project Manager app
 */

// Touch-friendly minimum sizes for interactive elements
export const TOUCH_TARGET_SIZE = {
  minimum: "44px", // WCAG AA standard
  comfortable: "48px", // Preferred size
  large: "56px" // For primary actions
} as const

// Responsive spacing utilities
export const responsiveSpacing = {
  xs: "space-y-2 md:space-y-3",
  sm: "space-y-3 md:space-y-4", 
  md: "space-y-4 md:space-y-6",
  lg: "space-y-6 md:space-y-8",
  xl: "space-y-8 md:space-y-12"
} as const

export const responsiveGaps = {
  xs: "gap-2 md:gap-3",
  sm: "gap-3 md:gap-4",
  md: "gap-4 md:gap-6", 
  lg: "gap-6 md:gap-8",
  xl: "gap-8 md:gap-12"
} as const

// Grid utilities for common responsive layouts
export const responsiveGrids = {
  stats: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  cards: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  kanban: "grid-cols-1 lg:grid-cols-3",
  forms: "grid-cols-1 md:grid-cols-2",
  actions: "grid-cols-2 sm:grid-cols-4"
} as const

// Typography responsive utilities
export const responsiveText = {
  title: "text-2xl sm:text-3xl",
  subtitle: "text-lg sm:text-xl", 
  body: "text-sm sm:text-base",
  caption: "text-xs sm:text-sm"
} as const

// Container utilities for consistent mobile layouts
export const mobileContainer = {
  base: "px-4 sm:px-6 lg:px-8",
  narrow: "px-3 sm:px-4 lg:px-6", 
  wide: "px-6 sm:px-8 lg:px-12"
} as const

/**
 * Create mobile-optimized button classes
 */
export function getMobileButtonClasses(size: "sm" | "md" | "lg" = "md") {
  const baseClasses = "touch-manipulation"
  
  switch (size) {
    case "sm":
      return cn(baseClasses, `min-h-[${TOUCH_TARGET_SIZE.minimum}]`)
    case "lg": 
      return cn(baseClasses, `min-h-[${TOUCH_TARGET_SIZE.large}]`)
    default:
      return cn(baseClasses, `min-h-[${TOUCH_TARGET_SIZE.comfortable}]`)
  }
}

/**
 * Create mobile-optimized card classes
 */
export function getMobileCardClasses(interactive: boolean = false) {
  const baseClasses = "transition-all duration-200"
  
  if (interactive) {
    return cn(baseClasses, "touch-manipulation hover:shadow-md active:scale-[0.98]")
  }
  
  return baseClasses
}

/**
 * Create mobile-optimized input classes
 */
export function getMobileInputClasses() {
  return cn(
    "touch-manipulation",
    `min-h-[${TOUCH_TARGET_SIZE.comfortable}]`,
    "text-base", // Prevents zoom on iOS
    "focus:ring-2 focus:ring-offset-2"
  )
}

/**
 * Create responsive flex layouts
 */
export const responsiveFlex = {
  header: "flex flex-col sm:flex-row sm:items-center sm:justify-between",
  stack: "flex flex-col gap-4 md:gap-6",
  sidebar: "flex flex-col lg:flex-row",
  centered: "flex flex-col items-center justify-center",
  spaceBetween: "flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-4"
} as const

/**
 * Scrolling utilities for mobile
 */
export const mobileScroll = {
  vertical: "overflow-y-auto overscroll-contain",
  horizontal: "overflow-x-auto overscroll-contain", 
  both: "overflow-auto overscroll-contain",
  virtualizedList: "max-h-[50vh] overflow-y-auto overscroll-contain"
} as const

/**
 * Mobile-specific layout utilities
 */
export const mobileLayout = {
  fullHeight: "min-h-screen",
  safeArea: "pb-safe-area-inset-bottom",
  stickyHeader: "sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
  modal: "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
  drawer: "fixed inset-x-0 bottom-0 z-50 mt-24 h-[calc(100%-6rem)] rounded-t-lg border bg-background"
} as const

/**
 * Responsive visibility utilities
 */
export const responsive = {
  hideOnMobile: "hidden sm:block",
  hideOnDesktop: "block sm:hidden",
  showOnTablet: "hidden md:block lg:hidden",
  mobileOnly: "sm:hidden",
  tabletUp: "hidden sm:block",
  desktopUp: "hidden lg:block"
} as const

/**
 * Animation utilities for mobile interactions
 */
export const mobileAnimations = {
  fadeIn: "animate-in fade-in-0 duration-200",
  slideUp: "animate-in slide-in-from-bottom-4 duration-300",
  slideDown: "animate-in slide-in-from-top-4 duration-300", 
  scale: "animate-in zoom-in-95 duration-200",
  bounce: "transition-transform active:scale-95"
} as const

/**
 * Mobile-optimized form layouts
 */
export function getMobileFormClasses() {
  return {
    container: cn(responsiveSpacing.md, mobileContainer.base),
    fieldset: cn(responsiveSpacing.sm, "space-y-4"),
    field: "space-y-2",
    label: "text-sm font-medium",
    input: getMobileInputClasses(),
    actions: cn(responsiveFlex.spaceBetween, "pt-6")
  }
}

/**
 * Breakpoint-aware conditional classes
 */
export function conditionalClasses(mobile: string, tablet?: string, desktop?: string) {
  const classes = [mobile]
  
  if (tablet) {
    classes.push(`md:${tablet}`)
  }
  
  if (desktop) {
    classes.push(`lg:${desktop}`)
  }
  
  return cn(...classes)
}
