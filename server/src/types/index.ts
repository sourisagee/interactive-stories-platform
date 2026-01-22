export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T | null;
  error: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export * from "./user";
