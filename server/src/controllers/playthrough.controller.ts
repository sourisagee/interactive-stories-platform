import { Request } from "express";
import { TypedResponse } from "../types";
import formatResponse from "../utils/formatResponse";
import PlaythroughService from "../services/playthrough.service";

export default class PlaythroughController {
  static async startPlaythrough(
    req: Request,
    res: TypedResponse,
  ): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      const { storyId } = req.body;

      if (!userId) {
        res
          .status(401)
          .json(formatResponse(401, "Пользователь не авторизован", null));
        return;
      }

      const playthrough = await PlaythroughService.startPlaythrough(
        userId,
        storyId,
      );

      res
        .status(201)
        .json(formatResponse(201, "Прохождение успешно начато", playthrough));
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Внутренняя ошибка сервера";
      res
        .status(500)
        .json(formatResponse(500, "Внутренняя ошибка сервера", null, msg));
    }
  }

  static async getCurrentPlaythrough(
    req: Request,
    res: TypedResponse,
  ): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      const { storyId } = req.body;

      if (!userId) {
        res
          .status(401)
          .json(formatResponse(401, "Пользователь не авторизован", null));
        return;
      }

      const playthrough = await PlaythroughService.getCurrentPlaythrough(
        userId,
        Number(storyId),
      );

      if (!playthrough) {
        res
          .status(404)
          .json(formatResponse(404, "Прохождение не найдено", null));
        return;
      }

      res
        .status(200)
        .json(formatResponse(200, "Прохождение найдено", playthrough));
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Внутренняя ошибка сервера";
      res
        .status(500)
        .json(formatResponse(500, "Внутренняя ошибка сервера", null, msg));
    }
  }

  static async makeChoice(req: Request, res: TypedResponse): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      const { playthroughId } = req.params;
      const { choiceId, variables } = req.body;

      if (!userId) {
        res
          .status(401)
          .json(formatResponse(401, "Пользователь не авторизован", null));
        return;
      }

      const playthrough = await PlaythroughService.makeChoice(
        Number(playthroughId),
        choiceId,
        userId,
        variables,
      );

      res
        .status(200)
        .json(formatResponse(200, "Выбор успешно сделан", playthrough));
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Внутренняя ошибка сервера";
      res
        .status(500)
        .json(formatResponse(500, "Внутренняя ошибка сервера", null, msg));
    }
  }

  static async getAvailableChoices(
    req: Request,
    res: TypedResponse,
  ): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      const { playthroughId } = req.params;

      if (!userId) {
        res
          .status(401)
          .json(formatResponse(401, "Пользователь не авторизован", null));
        return;
      }

      const choices = await PlaythroughService.getAvailableChoices(
        Number(playthroughId),
        userId,
      );

      res
        .status(200)
        .json(formatResponse(200, "Доступные выборы получены", choices));
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Внутренняя ошибка сервера";
      res
        .status(500)
        .json(formatResponse(500, "Внутренняя ошибка сервера", null, msg));
    }
  }

  static async getUserPlaythroughs(
    req: Request,
    res: TypedResponse,
  ): Promise<void> {
    try {
      const userId = res.locals.user?.id;

      if (!userId) {
        res
          .status(401)
          .json(formatResponse(401, "Пользователь не авторизован", null));
        return;
      }

      const playthroughs = await PlaythroughService.getUserPlaythroughs(userId);

      res
        .status(200)
        .json(
          formatResponse(
            200,
            "Прохождения пользователя получены",
            playthroughs,
          ),
        );
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Внутренняя ошибка сервера";
      res
        .status(500)
        .json(formatResponse(500, "Внутренняя ошибка сервера", null, msg));
    }
  }

  static async getPlaythroughProgress(
    req: Request,
    res: TypedResponse,
  ): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      const { playthroughId } = req.params;

      if (!userId) {
        res
          .status(401)
          .json(formatResponse(401, "Пользователь не авторизован", null));
        return;
      }

      const progress = await PlaythroughService.getPlaythroughProgress(
        Number(playthroughId),
        userId,
      );

      res
        .status(200)
        .json(formatResponse(200, "Прогресс прохождения получен", progress));
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Внутренняя ошибка сервера";
      res
        .status(500)
        .json(formatResponse(500, "Внутренняя ошибка сервера", null, msg));
    }
  }

  static async resetPlaythrough(
    req: Request,
    res: TypedResponse,
  ): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      const { playthroughId } = req.params;

      if (!userId) {
        res
          .status(401)
          .json(formatResponse(401, "Пользователь не авторизован", null));
        return;
      }

      const playthrough = await PlaythroughService.resetPlaythrough(
        Number(playthroughId),
        userId,
      );

      res
        .status(200)
        .json(formatResponse(200, "Прохождение сброшено", playthrough));
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Внутренняя ошибка сервера";
      res
        .status(500)
        .json(formatResponse(500, "Внутренняя ошибка сервера", null, msg));
    }
  }
}
