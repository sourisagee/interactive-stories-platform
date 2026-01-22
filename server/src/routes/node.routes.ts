import { Router } from "express";
import { NodeController } from "../controllers/node.controller";
import verifyAccessToken from "../middleware/verifyAccessToken";
import type { TypedResponse } from "../types";

const nodeRouter = Router();

// Публичные роуты 
nodeRouter.get("/", (req, res) =>
  NodeController.getNodes(req, res as TypedResponse)
);
nodeRouter.get("/:id", (req, res) =>
  NodeController.getNodeById(req, res as TypedResponse)
);

// Приватные роуты 
nodeRouter.post("/", verifyAccessToken, (req, res) =>
  NodeController.createNode(req, res as TypedResponse)
);
nodeRouter.put("/:id", verifyAccessToken, (req, res) =>
  NodeController.updateNode(req, res as TypedResponse)
);
nodeRouter.delete("/:id", verifyAccessToken, (req, res) =>
  NodeController.deleteNode(req, res as TypedResponse)
);

export default nodeRouter;
