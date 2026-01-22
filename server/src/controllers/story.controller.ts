import { Request } from "express";
import { storyService } from "../services/story.service";
import formatResponse from "../utils/formatResponse";
import { CreateStoryDto, UpdateStoryDto } from "../types/story";
import type { TypedResponse } from "../types";

export class StoryController {
  /**
   * Создать новую историю
   * POST /api/stories
   */
  static async createStory(req: Request, res: TypedResponse): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      if (!userId) {
        res.status(401).json(formatResponse(401, "Unauthorized", null, null));
        return;
      }

      const storyData: CreateStoryDto = {
        ...req.body,
        authorId: userId,
      };

      const story = await storyService.createStory(storyData);
      res.status(201).json(formatResponse(201, "Story created", story, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }

  /**
   * Получить историю по ID
   * GET /api/stories/:id?include=author,nodes
   */
  static async getStoryById(req: Request, res: TypedResponse): Promise<void> {
    try {
      const id = Number(req.params.id);
      const include = req.query.include as string;
      let story;

      if (include?.includes("author") && include?.includes("nodes")) {
        story = await storyService.getStoryFull(id);
      } else if (include?.includes("author")) {
        story = await storyService.getStoryWithAuthor(id);
      } else if (include?.includes("nodes")) {
        story = await storyService.getStoryWithNodes(id);
      } else {
        story = await storyService.getStoryById(id);
      }

      if (!story) {
        res
          .status(404)
          .json(formatResponse(404, "Story not found", null, null));
        return;
      }

      res.json(formatResponse(200, "Story retrieved", story, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }

  /**
   * Обновить историю
   * PUT /api/stories/:id
   */
  static async updateStory(req: Request, res: TypedResponse): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      if (!userId) {
        res.status(401).json(formatResponse(401, "Unauthorized", null, null));
        return;
      }

      const id = Number(req.params.id);
      const updateData: UpdateStoryDto = req.body;
      const updatedStory = await storyService.updateStory(id, updateData);

      res.json(formatResponse(200, "Story updated", updatedStory, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }

  /**
   * Удалить историю
   * DELETE /api/stories/:id
   */
  static async deleteStory(req: Request, res: TypedResponse): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      if (!userId) {
        res.status(401).json(formatResponse(401, "Unauthorized", null, null));
        return;
      }

      const id = Number(req.params.id);
      const deletedStory = await storyService.deleteStory(id);
      res.json(formatResponse(200, "Story deleted", deletedStory, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }

  /**
   * Получить истории
   * GET /api/stories?author=123
   */
  static async getStories(req: Request, res: TypedResponse): Promise<void> {
    try {
      const authorId = req.query.author ? Number(req.query.author) : undefined;

      let stories;
      if (authorId) {
        stories = await storyService.getStoriesByAuthor(authorId);
      } else {
        stories = await storyService.getAllStories();
      }

      res.json(formatResponse(200, "Stories retrieved", stories, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }

  /**
   * Получить мои истории
   * GET /api/stories/my
   */
  static async getMyStories(req: Request, res: TypedResponse): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      if (!userId) {
        res.status(401).json(formatResponse(401, "Unauthorized", null, null));
        return;
      }

      const stories = await storyService.getStoriesByAuthor(userId);
      res.json(formatResponse(200, "User stories retrieved", stories, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }
}
