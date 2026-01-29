import { Request } from "express";
import { StatsService } from "../services/stats.service";
import formatResponse from "../utils/formatResponse";
import type { TypedResponse } from "../types";

export class StatsController {
  static async getMyStats(_req: Request, res: TypedResponse): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      if (!userId) {
        res.status(401).json(formatResponse(401, "Unauthorized", null, null));
        return;
      }

      const stats = await StatsService.getUserStats(userId);
      res.json(formatResponse(200, "Stats retrieved", stats, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }

  static async getUserStats(req: Request, res: TypedResponse): Promise<void> {
    try {
      const userId = Number(req.params.id);

      if (isNaN(userId) || userId <= 0) {
        res
          .status(400)
          .json(formatResponse(400, "Invalid user ID", null, null));
        return;
      }

      const stats = await StatsService.getUserStats(userId);
      res.json(formatResponse(200, "Stats retrieved", stats, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }
}
