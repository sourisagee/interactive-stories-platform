import { Request } from "express";
import { ratingService } from "../services/rating.service";
import formatResponse from "../utils/formatResponse";
import type { TypedResponse } from "../types";
import prisma from "../lib/prisma";

export class RatingController {
  static async getStoryRating(req: Request, res: TypedResponse): Promise<void> {
    try {
      const storyId = Number(req.params.id); 
      const userId = res.locals.user?.id;

      if (isNaN(storyId) || storyId <= 0) {
        res
          .status(400)
          .json(formatResponse(400, "Invalid story ID", null, null));
        return;
      }

      const story = await prisma.story.findUnique({
        where: { id: storyId },
        select: { id: true },
      });

      if (!story) {
        res
          .status(404)
          .json(formatResponse(404, "Story not found", null, null));
        return;
      }

      const ratingInfo = await ratingService.getStoryRatingInfo(
        storyId,
        userId
      );

      res.json(formatResponse(200, "Rating info retrieved", ratingInfo, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }

  static async createRating(
    req: Request,
    res: TypedResponse
  ): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      if (!userId) {
        res.status(401).json(formatResponse(401, "Unauthorized", null, null));
        return;
      }

      const storyId = Number(req.params.id); 
      if (isNaN(storyId) || storyId <= 0) {
        res
          .status(400)
          .json(formatResponse(400, "Invalid story ID", null, null));
        return;
      }

      const { rating } = req.body;

      if (!rating || typeof rating !== "number") {
        res
          .status(400)
          .json(formatResponse(400, "Rating is required", null, null));
        return;
      }

      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        res
          .status(400)
          .json(
            formatResponse(
              400,
              "Rating must be an integer between 1 and 5",
              null,
              null
            )
          );
        return;
      }

      const canRate = await ratingService.canUserRateStory(userId, storyId);
      if (!canRate.canRate) {
        const statusCode = canRate.reason?.includes("уже проголосовали") ? 409 : 403;
        res
          .status(statusCode)
          .json(formatResponse(statusCode, canRate.reason || "Cannot rate", null, null));
        return;
      }

      await ratingService.createRating(userId, storyId, rating);

      const ratingInfo = await ratingService.getStoryRatingInfo(
        storyId,
        userId
      );

      res.json(
        formatResponse(200, "Rating created", ratingInfo, null)
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      if (msg.includes("уже проголосовал")) {
        res.status(409).json(formatResponse(409, msg, null, msg));
        return;
      }
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }

  static async deleteRating(req: Request, res: TypedResponse): Promise<void> {
    try {
      const userId = res.locals.user?.id;
      if (!userId) {
        res.status(401).json(formatResponse(401, "Unauthorized", null, null));
        return;
      }

      const storyId = Number(req.params.id); 
      if (isNaN(storyId) || storyId <= 0) {
        res
          .status(400)
          .json(formatResponse(400, "Invalid story ID", null, null));
        return;
      }

      await ratingService.deleteRating(userId, storyId);

      const ratingInfo = await ratingService.getStoryRatingInfo(
        storyId,
        userId
      );

      res.json(formatResponse(200, "Rating deleted", ratingInfo, null));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }

  static async getPopularStories(
    req: Request,
    res: TypedResponse
  ): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 4;
      const popularStories = await ratingService.getPopularStories(limit);

      const storyIds = popularStories.map((ps) => ps.storyId);
      
      if (storyIds.length === 0) {
        res.json(formatResponse(200, "Popular stories retrieved", [], null));
        return;
      }

      const stories = await prisma.story.findMany({
        where: {
          id: { in: storyIds },
          isPublished: true,
        },
      });

      const storiesWithRatings = popularStories
        .map((ratingInfo) => {
          const story = stories.find((s) => s.id === ratingInfo.storyId);
          if (!story) return null;
          
          return {
            id: story.id,
            cover: story.cover,
            title: story.title,
            genre: story.genre,
            authorName: story.authorName,
            description: story.description,
            isPublished: story.isPublished,
            authorId: story.authorId,
            createdAt: story.createdAt.toISOString(),
            updatedAt: story.updatedAt.toISOString(),
            averageRating: ratingInfo.averageRating,
            totalRatings: ratingInfo.totalRatings,
          };
        })
        .filter((story) => story !== null);

      res.json(
        formatResponse(200, "Popular stories retrieved", storiesWithRatings, null)
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Internal server error";
      res.status(500).json(formatResponse(500, "Error", null, msg));
    }
  }
}
