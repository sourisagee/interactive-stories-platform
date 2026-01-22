import prisma from "../lib/prisma";
import type { CreateChoiceData, UpdateChoiceData } from "../types/choice";
import type { Choice, Node, Story } from "@prisma/client"

interface ChoiceWithRelations extends Choice {
  fromNode?: Node;
  toNode?: Node;
};

interface ChoiceWithStory extends Choice {
  fromNode: Node & { story: Story };
};

interface ChoiceWithBothNodes extends Choice {
  fromNode: Node;
  toNode: Node;
}

export default class ChoiceService {
  static async createChoice(data: CreateChoiceData, userId: number): Promise<Choice | null> {
    const fromNode = await prisma.node.findUnique({
      where: { id: data.fromNodeId },
      include: { story: true },
    });

    if (!fromNode || fromNode.story.authorId !== userId) return null;

    const toNode = await prisma.node.findUnique({
      where: { id: data.toNodeId },
      include: { story: true },
    });

    if (!toNode || fromNode.storyId !== toNode.storyId) return null;

    if (!data.choiceText.trim()) return null;

    return await prisma.choice.create({
      data: {
        choiceText: data.choiceText.trim(),
        fromNodeId: data.fromNodeId,
        toNodeId: data.toNodeId,
      },
    });
  }

  static async updateChoice(
    data: UpdateChoiceData,
    choiceId: number,
    userId: number,
  ): Promise<Choice | null> {
    const choice = await prisma.choice.findUnique({
      where: { id: choiceId },
      include: { fromNode: { include: { story: true } } },
    });

    if (!choice || choice.fromNode.story.authorId !== userId) return null;

    if (data.fromNodeId) {
      const newFromNode = await prisma.node.findUnique({
        where: { id: data.fromNodeId },
        include: { story: true },
      });

      if (!newFromNode || newFromNode.storyId !== choice.fromNode.storyId)
        return null;
    }

    if (data.toNodeId) {
      const newToNode = await prisma.node.findUnique({
        where: { id: data.toNodeId },
        include: { story: true },
      });

      if (!newToNode || newToNode.storyId !== choice.fromNode.storyId)
        return null;
    }

    const updateData: UpdateChoiceData = {};

    if (data.choiceText != null) updateData.choiceText = data.choiceText.trim();
    if (data.fromNodeId != null) updateData.fromNodeId = data.fromNodeId;
    if (data.toNodeId != null) updateData.toNodeId = data.toNodeId;

    if (Object.keys(updateData).length === 0) return choice;

    return await prisma.choice.update({
      where: { id: choiceId },
      data: updateData,
    });
  }

  static async deleteChoice(choiceId: number, userId: number): Promise<Choice | null> {
    const choice = await prisma.choice.findUnique({
      where: { id: choiceId },
      include: { fromNode: { include: { story: true } } },
    });

    if (!choice || choice.fromNode.story.authorId !== userId) return null;

    return await prisma.choice.delete({ where: { id: choiceId } });
  }

  static async getAllChoicesForStory(storyId: number, userId: number): Promise<ChoiceWithBothNodes[] | null> {
    const story = await prisma.story.findFirst({
      where: { id: storyId, authorId: userId },
    });

    if (!story) return null;

    return await prisma.choice.findMany({
      where: {
        fromNode: { storyId },
        toNode: { storyId },
      },
      include: {
        fromNode: true,
        toNode: true,
      },
    });
  }

  static async getChoicesFromNode(nodeId: number, userId: number): Promise<ChoiceWithRelations[] | null> {
    const node = await prisma.node.findUnique({
      where: { id: nodeId },
      include: { story: true },
    });

    if (!node) return null;

    if (!node.story.isPublished && node.story.authorId !== userId) return null;

    return await prisma.choice.findMany({
      where: { fromNodeId: nodeId },
      include: {
        toNode: true,
      },
    });
  }

  static async getChoiceById(choiceId: number, userId: number): Promise<ChoiceWithStory | null> {
    const choice = await prisma.choice.findUnique({
      where: { id: choiceId },
      include: {
        fromNode: { include: { story: true } },
      },
    });

    if (!choice) return null;

    if (
      !choice.fromNode.story.isPublished &&
      choice.fromNode.story.authorId !== userId
    ) {
      return null;
    }

    return choice;
  }
}
