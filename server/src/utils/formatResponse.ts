import { ApiResponse } from '../types';

function formatResponse<T = unknown>(
  statusCode: number,
  message: string,
  data: T | null = null,
  error: unknown = null,
): ApiResponse<T> {
  return {
    statusCode,
    message,
    data,
    error,
  };
}

export default formatResponse;
