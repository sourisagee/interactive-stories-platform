import prisma from "../lib/prisma";
import type { CreateRatingDto, StoryRatingInfo } from "../types/rating";

export class RatingService {
  async createRating(
    userId: number,
    storyId: number,
    rating: number
  ): Promise<void> {
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storyId: {
          userId,
          storyId,
        },
      },
    });

    if (existingRating) {
      throw new Error("Пользователь уже проголосовал за эту историю");
    }

    await prisma.rating.create({
      data: {
        userId,
        storyId,
        rating,
      },
    });
  }

  async getStoryRatingInfo(
    storyId: number,
    userId?: number
  ): Promise<StoryRatingInfo> {
    const ratings = await prisma.rating.findMany({
      where: { storyId },
      select: { rating: true, userId: true },
    });

    const totalRatings = ratings.length;
    const averageRating =
      totalRatings > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0;

    let userRating: number | null = null;
    if (userId) {
      const userRatingRecord = ratings.find((r) => r.userId === userId);
      userRating = userRatingRecord ? userRatingRecord.rating : null;
    }

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Округление до 1 знака
      totalRatings,
      userRating,
    };
  }

  async getPopularStories(limit: number = 4): Promise<
    Array<{
      storyId: number;
      averageRating: number;
      totalRatings: number;
    }>
  > {
    const stories = await prisma.story.findMany({
      where: { isPublished: true },
      select: { id: true },
    });

    const storyRatings = await Promise.all(
      stories.map(async (story) => {
        const info = await this.getStoryRatingInfo(story.id);
        return {
          storyId: story.id,
          averageRating: info.averageRating,
          totalRatings: info.totalRatings,
        };
      })
    );

    const sorted = storyRatings
      .filter((sr) => sr.totalRatings > 0) 
      .sort((a, b) => {
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }

        return b.totalRatings - a.totalRatings;
      })
      .slice(0, limit);

    return sorted;
  }

  async deleteRating(userId: number, storyId: number): Promise<void> {
    await prisma.rating.deleteMany({
      where: {
        userId,
        storyId,
      },
    });
  }

  async canUserRateStory(
    userId: number,
    storyId: number
  ): Promise<{ canRate: boolean; reason?: string }> {
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { authorId: true },
    });

    if (!story) {
      return { canRate: false, reason: "История не найдена" };
    }

    if (story.authorId === userId) {
      return { canRate: false, reason: "Автор не может оценить свою историю" };
    }

    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storyId: {
          userId,
          storyId,
        },
      },
    });

    if (existingRating) {
      return { canRate: false, reason: "Вы уже проголосовали за эту историю" };
    }

    return { canRate: true };
  }
}

export const ratingService = new RatingService();
