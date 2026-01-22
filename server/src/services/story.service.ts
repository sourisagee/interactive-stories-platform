import { PrismaClient, Story } from "@prisma/client";
import {
  CreateStoryDto,
  UpdateStoryDto,
  StoryWithAuthor,
  StoryWithNodes,
  StoryFull,
} from "../types/story";

const prisma = new PrismaClient();

export class StoryService {
  // Создать новую историю
   
  async createStory(data: CreateStoryDto): Promise<Story> {
    return await prisma.story.create({
      data,
    });
  }

  // Получить историю по ID

  async getStoryById(id: number): Promise<Story | null> {
    return await prisma.story.findUnique({
      where: { id },
    });
  }

  // Получить историю по ID с автором
   
  async getStoryWithAuthor(id: number): Promise<StoryWithAuthor | null> {
    return await prisma.story.findUnique({
      where: { id },
      include: {
        author: true,
      },
    });
  }

  // Получить историю по ID с узлами
   
  async getStoryWithNodes(id: number): Promise<StoryWithNodes | null> {
    return await prisma.story.findUnique({
      where: { id },
      include: {
        nodes: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  // Получить полную историю с узлами и выборами
   
  async getStoryFull(id: number): Promise<StoryFull | null> {
    return await prisma.story.findUnique({
      where: { id },
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
  async updateStory(id: number, data: UpdateStoryDto): Promise<Story> {
    // Сначала проверяем, существует ли история и опубликована ли она
    const existingStory = await prisma.story.findUnique({
      where: { id },
      select: { id: true, isPublished: true },
    });

    if (!existingStory) {
      throw new Error("История не найдена");
    }

    if (existingStory.isPublished) {
      throw new Error("Нельзя редактировать опубликованную историю");
    }

    return await prisma.story.update({
      where: { id },
      data,
    });
  }

  //  Удалить историю (только если не опубликована)
   
  async deleteStory(id: number): Promise<Story> {
    // Сначала проверяем, существует ли история и опубликована ли она
    const existingStory = await prisma.story.findUnique({
      where: { id },
      select: { id: true, isPublished: true },
    });

    if (!existingStory) {
      throw new Error("История не найдена");
    }

    if (existingStory.isPublished) {
      throw new Error("Нельзя удалить опубликованную историю");
    }

    return await prisma.story.delete({
      where: { id },
    });
  }

  //  Получить все истории
   
  async getAllStories(): Promise<Story[]> {
    return await prisma.story.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  //  Получить истории автора
   
  async getStoriesByAuthor(authorId: number): Promise<Story[]> {
    return await prisma.story.findMany({
      where: { authorId },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const storyService = new StoryService();
