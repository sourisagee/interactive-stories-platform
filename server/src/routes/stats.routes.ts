import { Router } from "express";
import { StatsController } from "../controllers/stats.controller";
import verifyAccessToken from "../middleware/verifyAccessToken";
import type { TypedResponse } from "../types";

const statsRouter = Router();

statsRouter.get("/my", verifyAccessToken, (req, res) =>
  StatsController.getMyStats(req, res as TypedResponse)
);

statsRouter.get("/user/:id", (req, res) =>
  StatsController.getUserStats(req, res as TypedResponse)
);

export default statsRouter;