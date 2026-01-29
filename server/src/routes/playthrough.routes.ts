import { Router } from "express";
import verifyAccessToken from "../middleware/verifyAccessToken";
import PlaythroughController from '../controllers/playthrough.controller'

const playthroughRouter = Router();

// создаем новое прохождение
playthroughRouter
  .route("/start")
  .post(verifyAccessToken, PlaythroughController.startPlaythrough);

// получаем текущее прохождение
playthroughRouter
  .route("/current/:storyId")
  .get(verifyAccessToken, PlaythroughController.getCurrentPlaythrough);

// получаем все прохождения пользователя (до :id-маршрутов, чтобы /user/all не матчился как :playthroughId)
playthroughRouter
  .route("/user/all")
  .get(verifyAccessToken, PlaythroughController.getUserPlaythroughs);

// делаем выбор в текущем узле
playthroughRouter
  .route("/:playthroughId/choose")
  .post(verifyAccessToken, PlaythroughController.makeChoice);

// получаем выборы для текущего узла
playthroughRouter
  .route("/:playthroughId/choices")
  .get(verifyAccessToken, PlaythroughController.getAvailableChoices);

// получаем прогресс по текущему прохождению
playthroughRouter
  .route("/:playthroughId/progress")
  .get(verifyAccessToken, PlaythroughController.getPlaythroughProgress);

// сбрасываем прохождение
playthroughRouter
  .route("/:playthroughId/reset")
  .put(verifyAccessToken, PlaythroughController.resetPlaythrough);

export default playthroughRouter;
