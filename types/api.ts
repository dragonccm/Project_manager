// Add your API-specific types here
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface EmailApiPayload {
  to: string;
  subject: string;
  body: string;
}