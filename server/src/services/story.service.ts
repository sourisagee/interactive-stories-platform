import { PrismaClient, Story } from "@prisma/client";
import {
  CreateStoryDto,
  UpdateStoryDto,
  StoryWithAuthor,
  StoryFull,
} from "../types/story";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        "postgresql://postgres:password@localhost:5432/interactive_stories_db",
    },
  },
});

export class StoryService {
  // Создать новую историю

  async createStory(data: CreateStoryDto): Promise<Story> {
    return await prisma.story.create({
      data,
    });
  }

  // Получить историю по ID с автором

  async getStoryById(storyId: number): Promise<StoryWithAuthor | null> {
    return await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        author: true,
      },
    });
  }

  // Получить полную историю с узлами и выборами

  async getStoryFull(storyId: number): Promise<StoryFull | null> {
    return await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        author: true,
        nodes: {
          include: {
            fromChoices: true,
            toChoices: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  // Обновить историю (только если не опубликована)
  async updateStory(storyId: number, data: UpdateStoryDto): Promise<Story> {
    // Сначала проверяем, существует ли история и опубликована ли она
    const existingStory = await prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true, isPublished: true },
    });

    if (!existingStory) {
      throw new Error("История не найдена");
    }

    if (existingStory.isPublished) {
      throw new Error("Нельзя редактировать опубликованную историю");
    }

    return await prisma.story.update({
      where: { id: storyId },
      data,
    });
  }

  //  Удалить историю (только если не опубликована)

  async deleteStory(storyId: number): Promise<Story> {
    // Сначала проверяем, существует ли история и опубликована ли она
    const existingStory = await prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true, isPublished: true },
    });

    if (!existingStory) {
      throw new Error("История не найдена");
    }

    if (existingStory.isPublished) {
      throw new Error("Нельзя удалить опубликованную историю");
    }

    return await prisma.story.delete({
      where: { id: storyId },
    });
  }

  // Получить все истории с авторами

  async getAllStories(): Promise<StoryWithAuthor[]> {
    return await prisma.story.findMany({
      include: {
        author: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Получить истории автора с информацией об авторе

  async getStoriesByAuthor(authorId: number): Promise<StoryWithAuthor[]> {
    return await prisma.story.findMany({
      where: { authorId },
      include: {
        author: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const storyService = new StoryService();
