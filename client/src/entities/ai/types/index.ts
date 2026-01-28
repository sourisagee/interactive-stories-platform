/** Ответ от бэкенда на запрос генерации текста AI. */
export interface AiGenerateResponse {
  statusCode: number;
  message: string;
  data: string | null;
  error: unknown;
}

/** Запрос автора к AI‑помощнику  */
export interface AiAuthorPrompt {
  /** Свободный текст: идея истории, жанр, атмосфера, пожелания и т.п. */
  prompt: string;
}

