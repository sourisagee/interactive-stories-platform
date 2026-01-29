import axios from "axios";
import oAuth from "../utils/gigaChatAuth";
import type { AiCompletionResponse } from "../types/ai";

class AIService {
  /** Сгенерировать ответ от AI по текстовому prompt.
   *  Возвращает только текст ответа (message.content).
   */
  static async generateResponse(prompt: string): Promise<string> {
    try {
      const { access_token } = await oAuth();

      console.log("access_token", access_token);

      const response = await axios.post<AiCompletionResponse>(
        process.env.AI_URL as string,
        {
          model: "GigaChat",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful music advisor with curated music tastes. You are given a track and artist in a prompt and you need to recommend similar tracks to user. Answer in Russian language.",
            },
            { role: "user", content: prompt },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      const firstChoice = response.data.choices[0];
      return firstChoice?.message.content ?? "";
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`AI service error: ${message}`);
    }
  }
}

export default AIService;