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

      const nodeData: CreateNodeDto = req.body;
      const node = await nodeService.createNode(nodeData);
      res.status(201).json(formatResponse(201, "Node created", node, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }

  // Получить узел по ID GET /api/nodes/:id?include=story,choices
  static async getNodeById(req: Request, res: TypedResponse): Promise<void> {
    try {
      const id = Number(req.params.id);
      const include = req.query.include as string;
      let node;

      if (include?.includes("story") && include?.includes("choices")) {
        node = await nodeService.getNodeFull(id);
      } else if (include?.includes("story")) {
        node = await nodeService.getNodeWithStory(id);
      } else if (include?.includes("choices")) {
        node = await nodeService.getNodeWithChoices(id);
      } else {
        node = await nodeService.getNodeById(id);
      }

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

      const id = Number(req.params.id);
      const updateData: UpdateNodeDto = req.body;
      const updatedNode = await nodeService.updateNode(id, updateData);

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

      const id = Number(req.params.id);
      const deletedNode = await nodeService.deleteNode(id);
      res.json(formatResponse(200, "Node deleted", deletedNode, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }

  // Получить узлы GET /api/nodes?story=123
  static async getNodes(req: Request, res: TypedResponse): Promise<void> {
    try {
      const storyId = req.query.story ? Number(req.query.story) : undefined;

      let nodes;
      if (storyId) {
        nodes = await nodeService.getNodesByStory(storyId);
      } else {
        nodes = await nodeService.getAllNodes();
      }

      res.json(formatResponse(200, "Nodes retrieved", nodes, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }
}
