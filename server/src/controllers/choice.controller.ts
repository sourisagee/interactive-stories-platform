import { Request } from "express";
import { TypedResponse } from "../types";
import formatResponse from "../utils/formatResponse";
import ChoiceService from "../services/choice.service";
import { UpdateChoiceData } from "../types/choice";

export default class ChoiceController {
  static async createChoice(req: Request, res: TypedResponse): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      const { choiceText, fromNodeId, toNodeId } = req.body;

      if (!userId) {
        res.status(401).json(formatResponse(401, "Forbidden", null, null));
        return;
      }

      if (
        !choiceText ||
        typeof choiceText !== "string" ||
        typeof fromNodeId !== "number" ||
        typeof toNodeId !== "number"
      ) {
        res.status(400).json(formatResponse(400, "Invalid data", null, null));
        return;
      }

      const newChoice = await ChoiceService.createChoice(
        { choiceText, fromNodeId, toNodeId },
        userId,
      );

      if (!newChoice) {
        res
          .status(400)
          .json(formatResponse(400, "Failed to create choice", null, null));
        return;
      }

      res
        .status(201)
        .json(formatResponse(201, "Choice created", newChoice, null));
    } catch (error) {
      console.error("Error in createChoice:", error);
      res
        .status(500)
        .json(
          formatResponse(
            500,
            "Внутренняя ошибка сервера",
            null,
            error instanceof Error ? error.message : "Unknown error",
          ),
        );
    }
  }

  static async updateChoice(req: Request, res: TypedResponse): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      const { choiceText, fromNodeId, toNodeId } = req.body;
      const { choiceId } = req.params;

      if (!userId) {
        res.status(401).json(formatResponse(401, "Forbidden", null, null));
        return;
      }

      if (isNaN(Number(choiceId))) {
        res
          .status(400)
          .json(formatResponse(400, "Invalid choice ID", null, null));
        return;
      }

      const updateData: UpdateChoiceData = {};

      if (choiceText !== undefined) {
        if (typeof choiceText !== "string") {
          res
            .status(400)
            .json(formatResponse(400, "choiceText must be string", null, null));
          return;
        }
        updateData.choiceText = choiceText;
      }

      if (fromNodeId !== undefined) {
        if (typeof fromNodeId !== "number") {
          res
            .status(400)
            .json(formatResponse(400, "fromNodeId must be number", null, null));
          return;
        }
        updateData.fromNodeId = fromNodeId;
      }

      if (toNodeId !== undefined) {
        if (typeof toNodeId !== "number") {
          res
            .status(400)
            .json(formatResponse(400, "toNodeId must be number", null, null));
          return;
        }
        updateData.toNodeId = toNodeId;
      }

      if (Object.keys(updateData).length === 0) {
        res
          .status(400)
          .json(formatResponse(400, "No data to update", null, null));
        return;
      }

      const updatedChoice = await ChoiceService.updateChoice(
        updateData,
        Number(choiceId),
        userId,
      );

      if (!updatedChoice) {
        res
          .status(400)
          .json(formatResponse(400, "Failed to update choice", null, null));
        return;
      }

      res
        .status(200)
        .json(formatResponse(200, "Choice updated", updatedChoice, null));
    } catch (error) {
      console.error("Error in updateChoice:", error);
      res
        .status(500)
        .json(
          formatResponse(
            500,
            "Ошибка сервера",
            null,
            error instanceof Error ? error.message : "Unknown error",
          ),
        );
    }
  }

  static async deleteChoice(req: Request, res: TypedResponse): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      const { choiceId } = req.params;

      if (!userId) {
        res.status(401).json(formatResponse(401, "Forbidden", null, null));
        return;
      }

      if (isNaN(Number(choiceId))) {
        res
          .status(400)
          .json(formatResponse(400, "Invalid choice ID", null, null));
        return;
      }

      const result = await ChoiceService.deleteChoice(Number(choiceId), userId);

      if (!result) {
        res
          .status(400)
          .json(formatResponse(400, "Failed to delete choice", null, null));
        return;
      }

      res.status(200).json(formatResponse(200, "Choice deleted", null, null));
    } catch (error) {
      console.error("Error in deleteChoice:", error);
      res
        .status(500)
        .json(
          formatResponse(
            500,
            "Внутренняя ошибка сервера",
            null,
            error instanceof Error ? error.message : "Unknown error",
          ),
        );
    }
  }

  static async getAllChoicesForStory(
    req: Request,
    res: TypedResponse,
  ): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      const { storyId } = req.params;

      if (!userId) {
        res.status(401).json(formatResponse(401, "Forbidden", null, null));
        return;
      }

      if (isNaN(Number(storyId))) {
        res
          .status(400)
          .json(formatResponse(400, "Invalid story ID", null, null));
        return;
      }

      const storyChoices = await ChoiceService.getAllChoicesForStory(
        Number(storyId),
        userId,
      );

      if (!storyChoices) {
        res
          .status(403)
          .json(
            formatResponse(403, "Access denied or story not found", null, null),
          );
        return;
      }

      res
        .status(200)
        .json(formatResponse(200, "Choices for story: ", storyChoices, null));
    } catch (error) {
      console.error("Error in getAllChoicesForStory:", error);
      res
        .status(500)
        .json(
          formatResponse(
            500,
            "Внутренняя ошибка сервера",
            null,
            error instanceof Error ? error.message : "Unknown error",
          ),
        );
    }
  }

  static async getChoicesFromNode(
    req: Request,
    res: TypedResponse,
  ): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      const { nodeId } = req.params;

      if (!userId) {
        res.status(401).json(formatResponse(401, "Forbidden", null, null));
        return;
      }

      if (isNaN(Number(nodeId))) {
        res
          .status(400)
          .json(formatResponse(400, "Invalid node ID", null, null));
        return;
      }

      const nodeChoices = await ChoiceService.getChoicesFromNode(
        Number(nodeId),
        userId,
      );

      if (!nodeChoices) {
        res
          .status(403)
          .json(
            formatResponse(403, "Access denied or node not found", null, null),
          );
        return;
      }

      res
        .status(200)
        .json(formatResponse(200, "Choices for node: ", nodeChoices, null));
    } catch (error) {
      console.error("Error in getChoicesFromNode:", error);
      res
        .status(500)
        .json(
          formatResponse(
            500,
            "Внутренняя ошибка сервера",
            null,
            error instanceof Error ? error.message : "Unknown error",
          ),
        );
    }
  }

  static async getChoiceById(req: Request, res: TypedResponse): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      const { choiceId } = req.params;

      if (!userId) {
        res.status(401).json(formatResponse(401, "Forbidden", null, null));
        return;
      }

      if (isNaN(Number(choiceId))) {
        res
          .status(400)
          .json(formatResponse(400, "Invalid choice ID", null, null));
        return;
      }

      const choice = await ChoiceService.getChoiceById(
        Number(choiceId),
        userId,
      );

      if (!choice) {
        res
          .status(404)
          .json(
            formatResponse(
              404,
              "Choice not found or access denied",
              null,
              null,
            ),
          );
        return;
      }

      res.status(200).json(formatResponse(200, "Choice: ", choice, null));
    } catch (error) {
      console.error("Error in getChoiceById:", error);
      res
        .status(500)
        .json(
          formatResponse(
            500,
            "Внутренняя ошибка сервера",
            null,
            error instanceof Error ? error.message : "Unknown error",
          ),
        );
    }
  }
}
