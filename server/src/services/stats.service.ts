import prisma from "../lib/prisma";
import { UserRole } from "@prisma/client";

export interface PlayerStats {
  completedStories: number;
  inProgressStories: number;
  memberSince: Date;
}

export interface AuthorStats {
  totalStories: number;
  draftStories: number;
  memberSince: Date;
}

export class StatsService {
  // Получить статистику игрока
  static async getPlayerStats(userId: number): Promise<PlayerStats> {
    // Получаем пользователя для даты регистрации
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });

    // Получаем все прохождения пользователя
    const playthroughs = await prisma.playthrough.findMany({
      where: { userId },
    });

    const completedStories = playthroughs.filter((p) => p.isCompleted).length;
    const inProgressStories = playthroughs.filter((p) => !p.isCompleted).length;

    return {
      completedStories,
      inProgressStories,
      memberSince: user?.createdAt || new Date(),
    };
  }

  // Получить статистику автора
  static async getAuthorStats(userId: number): Promise<AuthorStats> {
    // Получаем пользователя для даты регистрации
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });

    // Получаем все истории автора
    const stories = await prisma.story.findMany({
      where: { authorId: userId },
    });

    const totalStories = stories.length;
    const draftStories = stories.filter((s) => !s.isPublished).length;

    return {
      totalStories,
      draftStories,
      memberSince: user?.createdAt || new Date(),
    };
  }

  // Получить статистику пользователя в зависимости от роли
  static async getUserStats(userId: number) {
    console.log("Getting stats for user:", userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, role: true },
    });

    console.log("Found user:", user);

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    if (user.role === UserRole.USER) {
      const playerStats = await this.getPlayerStats(userId);
      console.log("Player stats:", playerStats);
      return {
        user,
        playerStats,
      };
    } else if (user.role === UserRole.AUTHOR) {
      const authorStats = await this.getAuthorStats(userId);
      console.log("Author stats:", authorStats);
      return {
        user,
        authorStats,
      };
    }

    return { user };
  }
}
