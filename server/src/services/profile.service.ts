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

export interface AuthorStory {
  id: number;
  title: string;
  cover: string;
  genre: string;
  description: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ProfileService {
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

  // Получить истории автора (черновики и опубликованные)
  static async getAuthorStories(userId: number): Promise<{
    drafts: AuthorStory[];
    published: AuthorStory[];
  }> {
    const stories = await prisma.story.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        title: true,
        cover: true,
        genre: true,
        description: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const drafts: AuthorStory[] = [];
    const published: AuthorStory[] = [];

    stories.forEach((story) => {
      if (story.isPublished) {
        published.push(story);
      } else {
        drafts.push(story);
      }
    });

    return { drafts, published };
  }

  // Получить полную информацию профиля пользователя
  static async getUserProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, role: true },
    });

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    if (user.role === UserRole.USER) {
      const playerStats = await this.getPlayerStats(userId);
      return {
        user,
        playerStats,
      };
    } else if (user.role === UserRole.AUTHOR) {
      const authorStats = await this.getAuthorStats(userId);
      const authorStories = await this.getAuthorStories(userId);
      return {
        user,
        authorStats,
        authorStories,
      };
    }

    return { user };
  }
}
