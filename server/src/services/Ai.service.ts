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
                "Ты — AI-ассистент для авторов интерактивных историй. Ты помогаешь только с генерацией сюжетов, идей и текстов для интерактивных новелл/историй. Отвечай на русском. Если пользователь задаёт вопрос не по теме (не про сюжеты, идеи, написание историй, интерактивные новеллы и т.п.), ответь строго в духе: «Я не могу помочь в этом вопросе. Я могу подробно рассказывать про сюжеты, идеи и помогать с написанием интерактивных историй — задайте вопрос по этой теме.» Не давай советы по другим темам.",
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