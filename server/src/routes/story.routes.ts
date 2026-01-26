import { Router } from "express";
import { StoryController } from "../controllers/story.controller";
import { RatingController } from "../controllers/rating.controller";
import verifyAccessToken from "../middleware/verifyAccessToken";
import type { TypedResponse } from "../types";

const storyRouter = Router();


storyRouter.get("/", (req, res) =>
  StoryController.getStories(req, res as TypedResponse),
);

storyRouter.get("/popular", (req, res) =>
  RatingController.getPopularStories(req, res as TypedResponse),
);
storyRouter.get("/my/stories", verifyAccessToken, (req, res) =>
  StoryController.getMyStories(req, res as TypedResponse),
);
storyRouter.get("/:id/full", (req, res) => // :id - id истории
  StoryController.getStoryFull(req, res as TypedResponse),
);
storyRouter.get("/:id/rating", (req, res) => // :id - id истории
  RatingController.getStoryRating(req, res as TypedResponse),
);
storyRouter.get("/:id", (req, res) => // :id - id истории
  StoryController.getStoryById(req, res as TypedResponse),
);

storyRouter.post("/", verifyAccessToken, (req, res) =>
  StoryController.createStory(req, res as TypedResponse),
);
storyRouter.put("/:id", verifyAccessToken, (req, res) => 
  StoryController.updateStory(req, res as TypedResponse),
);
storyRouter.delete("/:id", verifyAccessToken, (req, res) => 
  StoryController.deleteStory(req, res as TypedResponse),
);
storyRouter.post("/:id/rating", verifyAccessToken, (req, res) => // :id - id истории
  RatingController.createRating(req, res as TypedResponse),
);
storyRouter.delete("/:id/rating", verifyAccessToken, (req, res) => // :id - id истории
  RatingController.deleteRating(req, res as TypedResponse),
);

export default storyRouter;
