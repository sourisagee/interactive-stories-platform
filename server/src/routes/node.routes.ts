import { Router } from "express";
import { NodeController } from "../controllers/node.controller";
import verifyAccessToken from "../middleware/verifyAccessToken";
import type { TypedResponse } from "../types";

const nodeRouter = Router();

nodeRouter.get("/", (req, res) =>
  NodeController.getNodes(req, res as TypedResponse)
);
nodeRouter.get("/:nodeId", (req, res) =>
  NodeController.getNodeById(req, res as TypedResponse)
);

nodeRouter.post("/", verifyAccessToken, (req, res) =>
  NodeController.createNode(req, res as TypedResponse)
);
nodeRouter.put("/:nodeId", verifyAccessToken, (req, res) =>
  NodeController.updateNode(req, res as TypedResponse)
);
nodeRouter.delete("/:nodeId", verifyAccessToken, (req, res) =>
  NodeController.deleteNode(req, res as TypedResponse)
);

export default nodeRouter;
