export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T | null;
  error: unknown;
}

export * from './user';
