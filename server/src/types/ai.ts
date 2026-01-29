export type AiRole = "system" | "user" | "assistant";

export interface AiMessage {
  role: AiRole;
  content: string;
}

export interface AiChoice {
  index?: number;
  message: AiMessage;
  finish_reason?: string | null;
}

export interface AiCompletionResponse {
  choices: AiChoice[];
}

export interface GigaChatAuthPayload {
  scope: string;
}

export interface GigaChatAuthData {
  access_token: string;
  expires_at?: string;
  token_type?: string;
  [key: string]: unknown;
}

export interface PoemRequestBody {
  title?: string;
}

export interface AiPromptRequestBody {
  prompt?: string;
}
