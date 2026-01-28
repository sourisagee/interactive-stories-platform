import { Router } from "express";
import verifyAccessToken from "../middleware/verifyAccessToken";
import ProfileController from "../controllers/profile.controller";

const profileRouter = Router();

// Получить мой профиль
profileRouter
  .route("/my")
  .get(verifyAccessToken, ProfileController.getMyProfile);

// Получить профиль пользователя по ID
profileRouter
  .route("/user/:userId")
  .get(verifyAccessToken, ProfileController.getUserProfile);

export default profileRouter;
