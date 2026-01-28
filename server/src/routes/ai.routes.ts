import { Router } from "express";
import AIController from "../controllers/Ai.controller";

const router = Router();

router.post("/generate", AIController.generateText);

export default router;