import { Request } from "express";
import { storyService } from "../services/story.service";
import formatResponse from "../utils/formatResponse";
import { CreateStoryDto, UpdateStoryDto } from "../types/story";
import type { TypedResponse } from "../types";

export class StoryController {
  // Создать новую историю POST /api/stories
  static async createStory(req: Request, res: TypedResponse): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      if (!userId) {
        res.status(401).json(formatResponse(401, "Unauthorized", null, null));
        return;
      }

      const { title, description, genre, authorName } = req.body;

      // Валидация обязательных полей
      if (!title || typeof title !== "string" || title.trim().length === 0) {
        res
          .status(400)
          .json(formatResponse(400, "Title is required", null, null));
        return;
      }

      if (
        !description ||
        typeof description !== "string" ||
        description.trim().length === 0
      ) {
        res
          .status(400)
          .json(formatResponse(400, "Description is required", null, null));
        return;
      }

      if (!genre || typeof genre !== "string" || genre.trim().length === 0) {
        res
          .status(400)
          .json(formatResponse(400, "Genre is required", null, null));
        return;
      }

      if (
        !authorName ||
        typeof authorName !== "string" ||
        authorName.trim().length === 0
      ) {
        res
          .status(400)
          .json(formatResponse(400, "Author name is required", null, null));
        return;
      }

      if (title.length > 200) {
        res
          .status(400)
          .json(
            formatResponse(400, "Title too long (max 200 chars)", null, null)
          );
        return;
      }

      if (description.length > 1000) {
        res
          .status(400)
          .json(
            formatResponse(
              400,
              "Description too long (max 1000 chars)",
              null,
              null
            )
          );
        return;
      }

      if (genre.length > 100) {
        res
          .status(400)
          .json(
            formatResponse(400, "Genre too long (max 100 chars)", null, null)
          );
        return;
      }

      if (authorName.length > 255) {
        res
          .status(400)
          .json(
            formatResponse(
              400,
              "Author name too long (max 255 chars)",
              null,
              null
            )
          );
        return;
      }

      const storyData: CreateStoryDto = {
        title: title.trim(),
        description: description.trim(),
        genre: genre.trim(),
        authorName: authorName.trim(),
        authorId: userId,
      };

      const story = await storyService.createStory(storyData);
      res.status(201).json(formatResponse(201, "Story created", story, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }

  // Получить историю с автором GET /api/stories/:id
  static async getStoryById(req: Request, res: TypedResponse): Promise<void> {
    try {
      const storyId = Number(req.params.id);

      // Валидация ID
      if (isNaN(storyId) || storyId <= 0) {
        res
          .status(400)
          .json(formatResponse(400, "Invalid story ID", null, null));
        return;
      }

      const story = await storyService.getStoryById(storyId);

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

  // Получить полную историю для игры GET /api/stories/:id/full
  static async getStoryFull(req: Request, res: TypedResponse): Promise<void> {
    try {
      const storyId = Number(req.params.id);

      // Валидация ID
      if (isNaN(storyId) || storyId <= 0) {
        res
          .status(400)
          .json(formatResponse(400, "Invalid story ID", null, null));
        return;
      }

      const story = await storyService.getStoryFull(storyId);

      if (!story) {
        res
          .status(404)
          .json(formatResponse(404, "Story not found", null, null));
        return;
      }

      res.json(formatResponse(200, "Full story retrieved", story, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }

  // Обновить историю PUT /api/stories/:id
  static async updateStory(req: Request, res: TypedResponse): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      if (!userId) {
        res.status(401).json(formatResponse(401, "Unauthorized", null, null));
        return;
      }

      const storyId = Number(req.params.id);

      // Валидация ID
      if (isNaN(storyId) || storyId <= 0) {
        res
          .status(400)
          .json(formatResponse(400, "Invalid story ID", null, null));
        return;
      }

      const { title, description, genre, authorName } = req.body;

      // Валидация данных для обновления
      if (title !== undefined) {
        if (typeof title !== "string" || title.trim().length === 0) {
          res
            .status(400)
            .json(formatResponse(400, "Title cannot be empty", null, null));
          return;
        }
        if (title.length > 200) {
          res
            .status(400)
            .json(
              formatResponse(400, "Title too long (max 200 chars)", null, null)
            );
          return;
        }
      }

      if (description !== undefined) {
        if (
          typeof description !== "string" ||
          description.trim().length === 0
        ) {
          res
            .status(400)
            .json(
              formatResponse(400, "Description cannot be empty", null, null)
            );
          return;
        }
        if (description.length > 1000) {
          res
            .status(400)
            .json(
              formatResponse(
                400,
                "Description too long (max 1000 chars)",
                null,
                null
              )
            );
          return;
        }
      }

      if (genre !== undefined) {
        if (typeof genre !== "string" || genre.trim().length === 0) {
          res
            .status(400)
            .json(formatResponse(400, "Genre cannot be empty", null, null));
          return;
        }
        if (genre.length > 100) {
          res
            .status(400)
            .json(
              formatResponse(400, "Genre too long (max 100 chars)", null, null)
            );
          return;
        }
      }

      if (authorName !== undefined) {
        if (typeof authorName !== "string" || authorName.trim().length === 0) {
          res
            .status(400)
            .json(
              formatResponse(400, "Author name cannot be empty", null, null)
            );
          return;
        }
        if (authorName.length > 255) {
          res
            .status(400)
            .json(
              formatResponse(
                400,
                "Author name too long (max 255 chars)",
                null,
                null
              )
            );
          return;
        }
      }

      const updateData: UpdateStoryDto = {};
      if (title !== undefined) updateData.title = title.trim();
      if (description !== undefined)
        updateData.description = description.trim();
      if (genre !== undefined) updateData.genre = genre.trim();
      if (authorName !== undefined) updateData.authorName = authorName.trim();

      const updatedStory = await storyService.updateStory(storyId, updateData);

      res.json(formatResponse(200, "Story updated", updatedStory, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }

  // Удалить историю DELETE /api/stories/:id
  static async deleteStory(req: Request, res: TypedResponse): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      if (!userId) {
        res.status(401).json(formatResponse(401, "Unauthorized", null, null));
        return;
      }

      const storyId = Number(req.params.id);

      // Валидация ID
      if (isNaN(storyId) || storyId <= 0) {
        res
          .status(400)
          .json(formatResponse(400, "Invalid story ID", null, null));
        return;
      }

      const deletedStory = await storyService.deleteStory(storyId);
      res.json(formatResponse(200, "Story deleted", deletedStory, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }

  // Получить истории GET /api/stories?author=123
  static async getStories(req: Request, res: TypedResponse): Promise<void> {
    try {
      const authorIdParam = req.query.author;
      let authorId: number | undefined;

      if (authorIdParam) {
        authorId = Number(authorIdParam);
        if (isNaN(authorId) || authorId <= 0) {
          res
            .status(400)
            .json(formatResponse(400, "Invalid author ID", null, null));
          return;
        }
      }

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

  // Получить мои истории GET /api/stories/my
  static async getMyStories(_req: Request, res: TypedResponse): Promise<void> {
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
