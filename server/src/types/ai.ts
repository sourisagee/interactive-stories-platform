/** Роль сообщения в чате AI */
export type AiRole = "system" | "user" | "assistant";

/** Сообщение, отправляемое/получаемое от AI */
export interface AiMessage {
  role: AiRole;
  content: string;
}

/** Один вариант ответа AI (choice) */
export interface AiChoice {
  index?: number;
  message: AiMessage;
  finish_reason?: string | null;
}

/** Ответ от AI-комплитера (формат, возвращаемый GigaChat API) */
export interface AiCompletionResponse {
  choices: AiChoice[];
}

/** Пэйлоад для авторизации в GigaChat */
export interface GigaChatAuthPayload {
  scope: string;
}

/** Ответ GigaChat OAuth: нам важен access_token, остальное – опционально */
export interface GigaChatAuthData {
  access_token: string;
  expires_at?: string;
  token_type?: string;
  [key: string]: unknown;
}

/** Тело запроса для генерации стихотворения в ChatController */
export interface PoemRequestBody {
  title?: string;
}

/** Тело запроса для AIController (генерация ответа по prompt) */
export interface AiPromptRequestBody {
  prompt?: string;
}
