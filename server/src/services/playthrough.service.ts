import prisma from "../lib/prisma";
import {
  Variables,
  MakeChoiceRequest,
  PlaythroughResponse,
  ChoiceResponse,
  ProgressResponse,
} from "../types/playthrough";

export default class PlaythroughService {
  // проверяет, что история существует и опубликована;
  // проверяет, нет ли уже прохождения playthrough для { userId, storyId };
  // находит стартовый узел и создаёт новое прохождение с currentNodeId = startNode.id, isCompleted = false.
  static async startPlaythrough(
    userId: number,
    storyId: number
  ): Promise<PlaythroughResponse> {
    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story || !story.isPublished) {
      throw new Error("История не найдена или не опубликована");
    }

    const existingPlaythrough = await prisma.playthrough.findUnique({
      where: { userId_storyId: { userId, storyId } },
      include: { story: true, currentNode: true },
    });

    if (existingPlaythrough) {
      throw new Error("Прохождение уже существует");
    }

    const startNode = await prisma.node.findFirst({
      where: { storyId, isStart: true },
    });

    if (!startNode) {
      throw new Error("В истории нет стартового узла");
    }

    const playthrough = await prisma.playthrough.create({
      data: {
        userId,
        storyId,
        currentNodeId: startNode.id,
        variables: {},
      },
      include: { story: true, currentNode: true },
    });

    return {
      id: playthrough.id,
      isCompleted: playthrough.isCompleted,
      variables: playthrough.variables,
      story: {
        id: playthrough.story.id,
        title: playthrough.story.title,
        authorName: playthrough.story.authorName,
      },
      currentNode: {
        id: playthrough.currentNode.id,
        picture: playthrough.currentNode.picture,
        title: playthrough.currentNode.title,
        content: playthrough.currentNode.content,
        isStart: playthrough.currentNode.isStart,
        isEnd: playthrough.currentNode.isEnd,
      },
      createdAt: playthrough.createdAt,
      updatedAt: playthrough.updatedAt,
    };
  }

  // находит существующее прохождение для { userId, storyId } и возвращает его вместе с текущим узлом.
  static async getCurrentPlaythrough(
    userId: number,
    storyId: number
  ): Promise<PlaythroughResponse | null> {
    const playthrough = await prisma.playthrough.findUnique({
      where: { userId_storyId: { userId, storyId } },
      include: { story: true, currentNode: true },
    });

    if (!playthrough) return null;

    return {
      id: playthrough.id,
      isCompleted: playthrough.isCompleted,
      variables: playthrough.variables,
      story: {
        id: playthrough.story.id,
        title: playthrough.story.title,
        authorName: playthrough.story.authorName,
      },
      currentNode: {
        id: playthrough.currentNode.id,
        picture: playthrough.currentNode.picture,
        title: playthrough.currentNode.title,
        content: playthrough.currentNode.content,
        isStart: playthrough.currentNode.isStart,
        isEnd: playthrough.currentNode.isEnd,
      },
      createdAt: playthrough.createdAt,
      updatedAt: playthrough.updatedAt,
    };
  }

  // проверяет, что прохождение существует и ещё не завершено;
  // проверяет, что выбор (choiceId) доступен из текущего узла;
  // обновляет currentNodeId, isCompleted, completedAt по тому, куда ведёт выбор;
  // возвращает обновлённое playthrough с новым currentNode.
  static async makeChoice(
    playthroughId: number,
    choiceId: number,
    userId: number,
    variables?: Variables
  ): Promise<PlaythroughResponse> {
    const playthrough = await prisma.playthrough.findFirst({
      where: { id: playthroughId, userId, isCompleted: false },
    });

    if (!playthrough) {
      throw new Error("Прохождение не найдено или уже завершено");
    }

    const choice = await prisma.choice.findFirst({
      where: { id: choiceId, fromNodeId: playthrough.currentNodeId },
    });

    if (!choice) {
      throw new Error("Выбор недоступен в текущем узле");
    }

    const targetNode = await prisma.node.findUnique({
      where: { id: choice.toNodeId },
    });

    if (!targetNode) {
      throw new Error("Целевой узел не найден");
    }

    const updatedPlaythrough = await prisma.playthrough.update({
      where: { id: playthroughId },
      data: {
        currentNodeId: choice.toNodeId,
        variables: (variables ?? playthrough.variables),
        isCompleted: targetNode.isEnd,
        completedAt: targetNode.isEnd ? new Date() : null,
      },
      include: { story: true, currentNode: true },
    });

    return {
      id: updatedPlaythrough.id,
      isCompleted: updatedPlaythrough.isCompleted,
      variables: updatedPlaythrough.variables,
      story: {
        id: updatedPlaythrough.story.id,
        title: updatedPlaythrough.story.title,
        authorName: updatedPlaythrough.story.authorName,
      },
      currentNode: {
        id: updatedPlaythrough.currentNode.id,
        picture: updatedPlaythrough.currentNode.picture,
        title: updatedPlaythrough.currentNode.title,
        content: updatedPlaythrough.currentNode.content,
        isStart: updatedPlaythrough.currentNode.isStart,
        isEnd: updatedPlaythrough.currentNode.isEnd,
      },
      createdAt: updatedPlaythrough.createdAt,
      updatedAt: updatedPlaythrough.updatedAt,
    };
  }

  static async getAvailableChoices(
    playthroughId: number,
    userId: number
  ): Promise<ChoiceResponse[]> {
    const playthrough = await prisma.playthrough.findFirst({
      where: { id: playthroughId, userId, isCompleted: false },
    });

    if (!playthrough) {
      throw new Error("Прохождение не найдено или завершено");
    }

    const choices = await prisma.choice.findMany({
      where: { fromNodeId: playthrough.currentNodeId },
      include: { toNode: true },
    });

    return choices.map((choice) => ({
      id: choice.id,
      choiceText: choice.choiceText,
      fromNodeId: choice.fromNodeId,
      toNode: {
        id: choice.toNode.id,
        title: choice.toNode.title,
        isEnd: choice.toNode.isEnd,
      },
    }));
  }

  // возвращает все прохождения пользователя
  static async getUserPlaythroughs(
    userId: number
  ): Promise<PlaythroughResponse[]> {
    const playthroughs = await prisma.playthrough.findMany({
      where: { userId },
      include: { story: true, currentNode: true },
      orderBy: { updatedAt: "desc" },
    });

    return playthroughs.map((playthrough) => ({
      id: playthrough.id,
      isCompleted: playthrough.isCompleted,
      variables: playthrough.variables,
      story: {
        id: playthrough.story.id,
        title: playthrough.story.title,
        authorName: playthrough.story.authorName,
      },
      currentNode: {
        id: playthrough.currentNode.id,
        picture: playthrough.currentNode.picture,
        title: playthrough.currentNode.title,
        content: playthrough.currentNode.content,
        isStart: playthrough.currentNode.isStart,
        isEnd: playthrough.currentNode.isEnd,
      },
      createdAt: playthrough.createdAt,
      updatedAt: playthrough.updatedAt,
    }));
  }

  static async getPlaythroughProgress(
    playthroughId: number,
    userId: number
  ): Promise<ProgressResponse> {
    const playthrough = await prisma.playthrough.findFirst({
      where: { id: playthroughId, userId },
      include: { story: true, currentNode: true },
    });

    if (!playthrough) {
      throw new Error("Прохождение не найдено");
    }

    const choices = await prisma.choice.findMany({
      where: { fromNodeId: playthrough.currentNodeId },
      include: { toNode: true },
    });

    const playthroughResponse: PlaythroughResponse = {
      id: playthrough.id,
      isCompleted: playthrough.isCompleted,
      variables: playthrough.variables,
      story: {
        id: playthrough.story.id,
        title: playthrough.story.title,
        authorName: playthrough.story.authorName,
      },
      currentNode: {
        id: playthrough.currentNode.id,
        picture: playthrough.currentNode.picture,
        title: playthrough.currentNode.title,
        content: playthrough.currentNode.content,
        isStart: playthrough.currentNode.isStart,
        isEnd: playthrough.currentNode.isEnd,
      },
      createdAt: playthrough.createdAt,
      updatedAt: playthrough.updatedAt,
    };

    const availableChoices: ChoiceResponse[] = choices.map((choice) => ({
      id: choice.id,
      choiceText: choice.choiceText,
      fromNodeId: choice.fromNodeId,
      toNode: {
        id: choice.toNode.id,
        title: choice.toNode.title,
        isEnd: choice.toNode.isEnd,
      },
    }));

    return {
      playthrough: playthroughResponse,
      availableChoices,
    };
  }

  static async resetPlaythrough(
    playthroughId: number,
    userId: number
  ): Promise<PlaythroughResponse> {
    const playthrough = await prisma.playthrough.findFirst({
      where: { id: playthroughId, userId },
      include: {
        story: {
          include: {
            nodes: {
              where: { isStart: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!playthrough) {
      throw new Error("Прохождение не найдено");
    }

    if (playthrough.story.nodes.length === 0) {
      throw new Error("В истории нет стартового узла");
    }

    const startNode = playthrough.story.nodes[0];

    const updatedPlaythrough = await prisma.playthrough.update({
      where: { id: playthroughId },
      data: {
        currentNodeId: startNode.id,
        variables: {},
        isCompleted: false,
        completedAt: null,
      },
      include: { story: true, currentNode: true },
    });

    return {
      id: updatedPlaythrough.id,
      isCompleted: updatedPlaythrough.isCompleted,
      variables: updatedPlaythrough.variables,
      story: {
        id: updatedPlaythrough.story.id,
        title: updatedPlaythrough.story.title,
        authorName: updatedPlaythrough.story.authorName,
      },
      currentNode: {
        id: updatedPlaythrough.currentNode.id,
        picture: updatedPlaythrough.currentNode.picture,
        title: updatedPlaythrough.currentNode.title,
        content: updatedPlaythrough.currentNode.content,
        isStart: updatedPlaythrough.currentNode.isStart,
        isEnd: updatedPlaythrough.currentNode.isEnd,
      },
      createdAt: updatedPlaythrough.createdAt,
      updatedAt: updatedPlaythrough.updatedAt,
    };
  }
}
