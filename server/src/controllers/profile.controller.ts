import { Request } from "express";
import { TypedResponse } from "../types";
import formatResponse from "../utils/formatResponse";
import { ProfileService } from "../services/profile.service";

export default class ProfileController {
  // Получить профиль текущего пользователя
  static async getMyProfile(req: Request, res: TypedResponse): Promise<void> {
    try {
      const userId = res.locals.user?.id;

      if (!userId) {
        res
          .status(401)
          .json(formatResponse(401, "Пользователь не авторизован", null));
        return;
      }

      const profile = await ProfileService.getUserProfile(userId);

      res.status(200).json(formatResponse(200, "Профиль получен", profile));
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Внутренняя ошибка сервера";
      res
        .status(500)
        .json(formatResponse(500, "Внутренняя ошибка сервера", null, msg));
    }
  }

  // Получить профиль пользователя по ID
  static async getUserProfile(req: Request, res: TypedResponse): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId || isNaN(Number(userId))) {
        res
          .status(400)
          .json(formatResponse(400, "Некорректный ID пользователя", null));
        return;
      }

      const profile = await ProfileService.getUserProfile(Number(userId));

      res.status(200).json(formatResponse(200, "Профиль получен", profile));
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Внутренняя ошибка сервера";
      res
        .status(500)
        .json(formatResponse(500, "Внутренняя ошибка сервера", null, msg));
    }
  }
}
