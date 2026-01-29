import { Story } from "@prisma/client";
import prisma from "../lib/prisma";
import {
  CreateStoryDto,
  UpdateStoryDto,
  StoryWithAuthor,
  StoryFull,
} from "../types/story";

export class StoryService {
  async createStory(data: CreateStoryDto): Promise<Story> {
    return await prisma.story.create({
      data,
    });
  }

  async getStoryById(storyId: number): Promise<StoryWithAuthor | null> {
    return await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        author: true,
      },
    });
  }

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

  async updateStory(storyId: number, data: UpdateStoryDto): Promise<Story> {
    const existingStory = await prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true, isPublished: true },
    });

    if (!existingStory) {
      throw new Error("История не найдена");
    }

    if (existingStory.isPublished) {
      const hasContentChanges =
        data.title ||
        data.description ||
        data.genre ||
        data.cover ||
        data.authorName;
      if (hasContentChanges) {
        throw new Error(
          "Нельзя редактировать содержимое опубликованной истории"
        );
      }
    }

    return await prisma.story.update({
      where: { id: storyId },
      data,
    });
  }

  async deleteStory(storyId: number): Promise<Story> {
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

  async getAllStories(): Promise<Story[]> {
    return await prisma.story.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async getStoriesByAuthor(authorId: number): Promise<Story[]> {
    return await prisma.story.findMany({
      where: { authorId },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const storyService = new StoryService();
