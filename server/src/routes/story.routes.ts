import { Router } from "express";
import { StoryController } from "../controllers/story.controller";
import verifyAccessToken from "../middleware/verifyAccessToken";
import type { TypedResponse } from "../types";

const storyRouter = Router();

// Публичные
storyRouter.get("/", (req, res) =>
  StoryController.getStories(req, res as TypedResponse),
);
storyRouter.get("/:storyId", (req, res) =>
  StoryController.getStoryById(req, res as TypedResponse),
);
storyRouter.get("/:storyId/full", (req, res) =>
  StoryController.getStoryFull(req, res as TypedResponse),
);

// Приватные
storyRouter.post("/", verifyAccessToken, (req, res) =>
  StoryController.createStory(req, res as TypedResponse),
);
storyRouter.put("/:storyId", verifyAccessToken, (req, res) =>
  StoryController.updateStory(req, res as TypedResponse),
);
storyRouter.delete("/:storyId", verifyAccessToken, (req, res) =>
  StoryController.deleteStory(req, res as TypedResponse),
);
storyRouter.get("/my/stories", verifyAccessToken, (req, res) =>
  StoryController.getMyStories(req, res as TypedResponse),
);

export default storyRouter;
