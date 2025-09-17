import {
  Download,
  FileText,
  Save,
  Plus,
  Trash2,
  Calendar,
  User,
  Tag,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Edit3,
} from "lucide-react"

// Report field definitions
export const REPORT_FIELDS = [
  { id: "title", label: "Task Title", icon: FileText },
  { id: "description", label: "Description", icon: FileText },
  { id: "project", label: "Project", icon: Tag },
  { id: "status", label: "Status", icon: CheckCircle2 },
  { id: "priority", label: "Priority", icon: AlertTriangle },
  { id: "assignee", label: "Assignee", icon: User },
  { id: "created_date", label: "Created Date", icon: Calendar },
  { id: "due_date", label: "Due Date", icon: Calendar },
  { id: "estimated_time", label: "Estimated Time", icon: Clock },
  { id: "actual_time", label: "Actual Time", icon: Clock },
  { id: "completed", label: "Completed", icon: CheckCircle2 },
]

// API endpoints
export const API_ENDPOINTS = {
  HEALTH: "/api/health",
  PROJECTS: "/api/projects",
  ACCOUNTS: "/api/accounts",
  TASKS: "/api/tasks",
  EMAIL: "/api/email",
  REPORT_TEMPLATES: "/api/report-templates",
  SETTINGS: "/api/settings",
  NOTES: "/api/notes",
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REGISTER: "/api/auth/register",
    VERIFY: "/api/auth/verify",
  },
} as const

// Status types
export const PROJECT_STATUS = {
  ACTIVE: "active",
  PAUSED: "paused", 
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const

export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const

export const PRIORITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const

// UI constants
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
} as const

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  AUTH_REQUIRED: "Authentication required. Please log in.",
  INVALID_DATA: "Invalid data provided.",
  SERVER_ERROR: "Server error. Please try again later.",
  FILE_TOO_LARGE: "File size exceeds the maximum limit.",
  UNSUPPORTED_FILE_TYPE: "Unsupported file type.",
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: "Data saved successfully.",
  DELETED: "Item deleted successfully.",
  UPDATED: "Item updated successfully.",
  CREATED: "Item created successfully.",
} as const
