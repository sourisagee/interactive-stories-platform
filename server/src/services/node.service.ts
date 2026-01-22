import { PrismaClient, Node } from "@prisma/client";
import {
  CreateNodeDto,
  UpdateNodeDto,
  NodeWithStory,
  NodeWithChoices,
  NodeFull,
} from "../types/node";

const prisma = new PrismaClient();

export class NodeService {
  // Создать новый узел
  async createNode(data: CreateNodeDto): Promise<Node> {
    return await prisma.node.create({
      data,
    });
  }

  // Получить узел по ID
  async getNodeById(id: number): Promise<Node | null> {
    return await prisma.node.findUnique({
      where: { id },
    });
  }

  // Получить узел по ID с историей
  async getNodeWithStory(id: number): Promise<NodeWithStory | null> {
    return await prisma.node.findUnique({
      where: { id },
      include: {
        story: true,
      },
    });
  }

  // Получить узел по ID с выборами
  async getNodeWithChoices(id: number): Promise<NodeWithChoices | null> {
    return await prisma.node.findUnique({
      where: { id },
      include: {
        fromChoices: true,
        toChoices: true,
      },
    });
  }

  // Получить полный узел (история + выборы)
  async getNodeFull(id: number): Promise<NodeFull | null> {
    return await prisma.node.findUnique({
      where: { id },
      include: {
        story: true,
        fromChoices: true,
        toChoices: true,
      },
    });
  }

  // Обновить узел
  async updateNode(id: number, data: UpdateNodeDto): Promise<Node> {
    return await prisma.node.update({
      where: { id },
      data,
    });
  }

  // Удалить узел
  async deleteNode(id: number): Promise<Node> {
    return await prisma.node.delete({
      where: { id },
    });
  }

  // Получить все узлы

  async getAllNodes(): Promise<Node[]> {
    return await prisma.node.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  // Получить узлы истории
  async getNodesByStory(storyId: number): Promise<Node[]> {
    return await prisma.node.findMany({
      where: { storyId },
      orderBy: { createdAt: "asc" },
    });
  }
}

export const nodeService = new NodeService();
