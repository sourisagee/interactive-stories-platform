export interface AiGenerateResponse {
  statusCode: number;
  message: string;
  data: string | null;
  error: unknown;
}

export interface AiAuthorPrompt {
  prompt: string;
}

