import prisma from "../lib/prisma";
import { CreateNodeDto, UpdateNodeDto, NodeWithChoices } from "../types/node";
import { Node } from "@prisma/client";

export class NodeService {
  async createNode(data: CreateNodeDto): Promise<Node> {
    return await prisma.node.create({
      data,
    });
  }

  async getNodeWithChoices(nodeId: number): Promise<NodeWithChoices | null> {
    return await prisma.node.findUnique({
      where: { id: nodeId },
      include: {
        fromChoices: true,
        toChoices: true,
      },
    });
  }
 
  async updateNode(nodeId: number, data: UpdateNodeDto): Promise<Node> {
    return await prisma.node.update({
      where: { id: nodeId },
      data,
    });
  }

  async deleteNode(nodeId: number): Promise<Node> {
    return await prisma.node.delete({
      where: { id: nodeId },
    });
  }

  async getNodesByStory(storyId: number): Promise<Node[]> {
    return await prisma.node.findMany({
      where: { storyId },
      orderBy: { createdAt: "asc" },
    });
  }
}

export const nodeService = new NodeService();
