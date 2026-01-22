import { Router } from "express";
import verifyAccessToken from "../middleware/verifyAccessToken";
import ChoiceController from "../controllers/choice.controller";

const choiceRouter = Router();

// ДЛЯ АВТОРОВ

// Создать выбор
choiceRouter.post("/", verifyAccessToken, ChoiceController.createChoice);

// Обновить выбор
choiceRouter.put(
  "/:choiceId",
  verifyAccessToken,
  ChoiceController.updateChoice,
);

// Удалить выбор
choiceRouter.delete(
  "/:choiceId",
  verifyAccessToken,
  ChoiceController.deleteChoice,
);

// Получить все выборы для истории (для редактирования графа)
choiceRouter.get(
  "/story/:storyId",
  verifyAccessToken,
  ChoiceController.getAllChoicesForStory,
);

// ДЛЯ ИГРОКОВ

// Получить выборы из узла (для прохождения)
choiceRouter.get(
  "/node/:nodeId",
  verifyAccessToken,
  ChoiceController.getChoicesFromNode,
);

// Получить информацию о выборе
choiceRouter.get(
  "/:choiceId",
  verifyAccessToken,
  ChoiceController.getChoiceById,
);

export default choiceRouter;
