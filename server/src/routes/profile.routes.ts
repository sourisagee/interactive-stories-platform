import { Router } from "express";
import verifyAccessToken from "../middleware/verifyAccessToken";
import ProfileController from "../controllers/profile.controller";

const profileRouter = Router();

profileRouter
  .route("/my")
  .get(verifyAccessToken, ProfileController.getMyProfile);

profileRouter
  .route("/user/:userId")
  .get(verifyAccessToken, ProfileController.getUserProfile);

export default profileRouter;
