import type { Request } from "express";
import AIService from "../services/Ai.service";
import formatResponse from "../utils/formatResponse";
import type { TypedResponse } from "../types";
import type { AiPromptRequestBody } from "../types/ai";

class AIController {
  static async generateText(
    req: Request<unknown, unknown, AiPromptRequestBody>,
    res: TypedResponse,
  ): Promise<void> {
    try {
      const { prompt } = req.body;

      if (!prompt) {
        res
          .status(400)
          .json(
            formatResponse(
              400,
              "Prompt is required",
              null,
              "Prompt is required",
            ),
          );
        return;
      }

      const response = await AIService.generateResponse(prompt);

      res
        .status(200)
        .json(
          formatResponse(200, "AI response generated successfully", response),
        );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      // eslint-disable-next-line no-console
      console.error(error);
      res
        .status(500)
        .json(
          formatResponse(500, "Internal server error", null, message),
        );
    }
  }
}

export default AIController;