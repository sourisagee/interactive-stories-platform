import { Router } from "express";
import verifyAccessToken from "../middleware/verifyAccessToken";
import ChoiceController from "../controllers/choice.controller";

const choiceRouter = Router();

// ДЛЯ АВТОРОВ

choiceRouter.post("/", verifyAccessToken, ChoiceController.createChoice);

choiceRouter.put(
  "/:choiceId",
  verifyAccessToken,
  ChoiceController.updateChoice,
);

choiceRouter.delete(
  "/:choiceId",
  verifyAccessToken,
  ChoiceController.deleteChoice,
);

choiceRouter.get(
  "/story/:storyId",
  verifyAccessToken,
  ChoiceController.getAllChoicesForStory,
);

// ДЛЯ ИГРОКОВ

choiceRouter.get(
  "/node/:nodeId",
  verifyAccessToken,
  ChoiceController.getChoicesFromNode,
);

choiceRouter.get(
  "/:choiceId",
  verifyAccessToken,
  ChoiceController.getChoiceById,
);

export default choiceRouter;
