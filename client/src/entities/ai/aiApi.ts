import { axiosInstance } from "../../shared/lib/axiosInstance";
import type { AiGenerateResponse } from "./types";

export class AiApi {
  // Запрос на бэкенд для генерации текста AI по prompt
  static async generateText(prompt: string): Promise<AiGenerateResponse> {
    const { data } = await axiosInstance.post<AiGenerateResponse>("/ai/generate", {
      prompt,
    });

    return data;
  }
}