import { Request } from "express";
import { nodeService } from "../services/node.service";
import formatResponse from "../utils/formatResponse";
import { CreateNodeDto, UpdateNodeDto } from "../types/node";
import type { TypedResponse } from "../types";

export class NodeController {
  // Создать новый узел POST /api/nodes
  static async createNode(req: Request, res: TypedResponse): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      if (!userId) {
        res.status(401).json(formatResponse(401, "Unauthorized", null, null));
        return;
      }

      const { title, content, picture, storyId } = req.body;

      // Валидация обязательных полей
      if (!title || typeof title !== "string" || title.trim().length === 0) {
        res
          .status(400)
          .json(formatResponse(400, "Title is required", null, null));
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

      if (
        !content ||
        typeof content !== "string" ||
        content.trim().length === 0
      ) {
        res
          .status(400)
          .json(formatResponse(400, "Content is required", null, null));
        return;
      }

      if (content.length > 5000) {
        res
          .status(400)
          .json(
            formatResponse(400, "Content too long (max 5000 chars)", null, null)
          );
        return;
      }

      if (
        !picture ||
        typeof picture !== "string" ||
        picture.trim().length === 0
      ) {
        res
          .status(400)
          .json(formatResponse(400, "Picture is required", null, null));
        return;
      }

      if (picture.length > 255) {
        res
          .status(400)
          .json(
            formatResponse(
              400,
              "Picture URL too long (max 255 chars)",
              null,
              null
            )
          );
        return;
      }

      // Проверка на валидный URL
      try {
        new URL(picture.trim());
      } catch {
        res
          .status(400)
          .json(formatResponse(400, "Picture must be a valid URL", null, null));
        return;
      }

      // Проверка на формат изображения
      const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".svg",
      ];
      const pictureUrl = picture.trim().toLowerCase();
      const hasValidExtension = imageExtensions.some(
        (ext) => pictureUrl.endsWith(ext) || pictureUrl.includes(ext + "?")
      );

      if (!hasValidExtension) {
        res
          .status(400)
          .json(
            formatResponse(
              400,
              "Picture must be an image file (.jpg, .jpeg, .png, .gif, .webp, .svg)",
              null,
              null
            )
          );
        return;
      }

      if (!storyId || isNaN(Number(storyId)) || Number(storyId) <= 0) {
        res
          .status(400)
          .json(formatResponse(400, "Valid story ID is required", null, null));
        return;
      }

      const nodeData: CreateNodeDto = {
        title: title.trim(),
        content: content.trim(),
        picture: picture.trim(),
        storyId: Number(storyId),
      };

      const node = await nodeService.createNode(nodeData);
      res.status(201).json(formatResponse(201, "Node created", node, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }

  // Получить узел с выборами GET /api/nodes/:id
  static async getNodeById(req: Request, res: TypedResponse): Promise<void> {
    try {
      const nodeId = Number(req.params.id);

      // Валидация ID
      if (isNaN(nodeId) || nodeId <= 0) {
        res
          .status(400)
          .json(formatResponse(400, "Invalid node ID", null, null));
        return;
      }

      const node = await nodeService.getNodeWithChoices(nodeId);

      if (!node) {
        res.status(404).json(formatResponse(404, "Node not found", null, null));
        return;
      }

      res.json(formatResponse(200, "Node retrieved", node, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }

  // Обновить узел PUT /api/nodes/:id
  static async updateNode(req: Request, res: TypedResponse): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      if (!userId) {
        res.status(401).json(formatResponse(401, "Unauthorized", null, null));
        return;
      }

      const nodeId = Number(req.params.id);

      // Валидация ID
      if (isNaN(nodeId) || nodeId <= 0) {
        res
          .status(400)
          .json(formatResponse(400, "Invalid node ID", null, null));
        return;
      }

      const { title, content, picture } = req.body;

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

      if (content !== undefined) {
        if (typeof content !== "string" || content.trim().length === 0) {
          res
            .status(400)
            .json(formatResponse(400, "Content cannot be empty", null, null));
          return;
        }
        if (content.length > 5000) {
          res
            .status(400)
            .json(
              formatResponse(
                400,
                "Content too long (max 5000 chars)",
                null,
                null
              )
            );
          return;
        }
      }

      if (picture !== undefined) {
        if (typeof picture !== "string" || picture.trim().length === 0) {
          res
            .status(400)
            .json(formatResponse(400, "Picture cannot be empty", null, null));
          return;
        }
        if (picture.length > 255) {
          res
            .status(400)
            .json(
              formatResponse(
                400,
                "Picture URL too long (max 255 chars)",
                null,
                null
              )
            );
          return;
        }

        // Проверка на валидный URL
        try {
          new URL(picture.trim());
        } catch {
          res
            .status(400)
            .json(
              formatResponse(400, "Picture must be a valid URL", null, null)
            );
          return;
        }

        // Проверка на формат изображения
        const imageExtensions = [
          ".jpg",
          ".jpeg",
          ".png",
          ".gif",
          ".webp",
          ".svg",
        ];
        const pictureUrl = picture.trim().toLowerCase();
        const hasValidExtension = imageExtensions.some(
          (ext) => pictureUrl.endsWith(ext) || pictureUrl.includes(ext + "?")
        );

        if (!hasValidExtension) {
          res
            .status(400)
            .json(
              formatResponse(
                400,
                "Picture must be an image file (.jpg, .jpeg, .png, .gif, .webp, .svg)",
                null,
                null
              )
            );
          return;
        }
      }

      const updateData: UpdateNodeDto = {};
      if (title !== undefined) updateData.title = title.trim();
      if (content !== undefined) updateData.content = content.trim();
      if (picture !== undefined) updateData.picture = picture.trim();

      const updatedNode = await nodeService.updateNode(nodeId, updateData);

      res.json(formatResponse(200, "Node updated", updatedNode, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }

  // Удалить узел DELETE /api/nodes/:id
  static async deleteNode(req: Request, res: TypedResponse): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      if (!userId) {
        res.status(401).json(formatResponse(401, "Unauthorized", null, null));
        return;
      }

      const nodeId = Number(req.params.id);

      // Валидация ID
      if (isNaN(nodeId) || nodeId <= 0) {
        res
          .status(400)
          .json(formatResponse(400, "Invalid node ID", null, null));
        return;
      }

      const deletedNode = await nodeService.deleteNode(nodeId);
      res.json(formatResponse(200, "Node deleted", deletedNode, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }

  // Получить узлы истории GET /api/nodes?story=123
  static async getNodes(req: Request, res: TypedResponse): Promise<void> {
    try {
      const storyIdParam = req.query.story;

      if (!storyIdParam) {
        res
          .status(400)
          .json(formatResponse(400, "Story ID required", null, null));
        return;
      }

      const storyId = Number(storyIdParam);
      if (isNaN(storyId) || storyId <= 0) {
        res
          .status(400)
          .json(formatResponse(400, "Invalid story ID", null, null));
        return;
      }

      const nodes = await nodeService.getNodesByStory(storyId);
      res.json(formatResponse(200, "Nodes retrieved", nodes, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }
}
