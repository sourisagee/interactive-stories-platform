import { Router } from "express";
import { StatsController } from "../controllers/stats.controller";
import verifyAccessToken from "../middleware/verifyAccessToken";
import type { TypedResponse } from "../types";

const statsRouter = Router();

// Получить мою статистику (требует авторизации)
statsRouter.get("/my", verifyAccessToken, (req, res) =>
  StatsController.getMyStats(req, res as TypedResponse)
);

// Получить статистику пользователя по ID (публичная)
statsRouter.get("/user/:id", (req, res) =>
  StatsController.getUserStats(req, res as TypedResponse)
);

export default statsRouter;