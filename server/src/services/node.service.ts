import { PrismaClient, Node } from "@prisma/client";
import { CreateNodeDto, UpdateNodeDto, NodeWithChoices } from "../types/node";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        "postgresql://postgres:password@localhost:5432/interactive_stories_db",
    },
  },
});

export class NodeService {
  // Создать новый узел
  async createNode(data: CreateNodeDto): Promise<Node> {
    return await prisma.node.create({
      data,
    });
  }

  // Получить узел с выборами (для редактора)
  async getNodeWithChoices(nodeId: number): Promise<NodeWithChoices | null> {
    return await prisma.node.findUnique({
      where: { id: nodeId },
      include: {
        fromChoices: true,
        toChoices: true,
      },
    });
  }

  // Обновить узел
  async updateNode(nodeId: number, data: UpdateNodeDto): Promise<Node> {
    return await prisma.node.update({
      where: { id: nodeId },
      data,
    });
  }

  // Удалить узел
  async deleteNode(nodeId: number): Promise<Node> {
    return await prisma.node.delete({
      where: { id: nodeId },
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
