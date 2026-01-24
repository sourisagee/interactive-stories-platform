import { Router } from "express";
import verifyAccessToken from "../middleware/verifyAccessToken";
import PlaythroughController from '../controllers/playthrough.controller'

// отвечает за игровой процесс пользователя
const playthroughRouter = Router();

// создаем новое прохождение
playthroughRouter
  .route("/start")
  .post(verifyAccessToken, PlaythroughController.startPlaythrough);

// получаем текущее прохождение
playthroughRouter
  .route("/current/:storyId")
  .get(verifyAccessToken, PlaythroughController.getCurrentPlaythrough);

// делаем выбор в текущем узле
playthroughRouter
  .route("/:playthroughId/choose")
  .post(verifyAccessToken, PlaythroughController.makeChoice);

// получаем выборы для текущего узла
playthroughRouter
  .route("/:playthroughId/choices")
  .get(verifyAccessToken, PlaythroughController.getAvailableChoices);

// получаем все прохождения пользователя
playthroughRouter
  .route("/user/all")
  .get(verifyAccessToken, PlaythroughController.getUserPlaythroughs);

// получаем прогресс по текущему прохождению
playthroughRouter
  .route("/:playthroughId/progress")
  .get(verifyAccessToken, PlaythroughController.getPlaythroughProgress);

// сбрасываем прохождение
playthroughRouter
  .route("/:playthroughId/reset")
  .put(verifyAccessToken, PlaythroughController.resetPlaythrough);

export default playthroughRouter;
