// User-related type definitions for authentication system
export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: "admin" | "user" | "viewer";
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role?: "admin" | "user" | "viewer";
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  role?: "admin" | "user" | "viewer";
}

export interface LoginCredentials {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
  last_accessed: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  new_password: string;
}

// Email verification types
export interface EmailVerification {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  verified_at?: string;
}