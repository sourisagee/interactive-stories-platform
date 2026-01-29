import type { StoryNode, Choice, FlowNode, FlowEdge } from "./index";
import { nanoid } from "nanoid";

export const convertToFlowNode = (node: StoryNode): FlowNode => ({
  ...node,
  position: { x: node.position_x, y: node.position_y },
  type: node.isStart ? "start" : node.isEnd ? "end" : "normal",
});

export const convertFromFlowNode = (flowNode: FlowNode): StoryNode => ({
  ...flowNode,
  position_x: flowNode.position.x,
  position_y: flowNode.position.y,
});

export const convertToFlowEdge = (choice: Choice): FlowEdge => ({
  id: `edge-${choice.id}`,
  source: choice.fromNodeId.toString(),
  target: choice.toNodeId.toString(),
  label: choice.choiceText,
  data: {
    choiceId: choice.id,
    choiceText: choice.choiceText,
    isTemporary: false,
  },
});

export const convertFromFlowEdge = (
  edge: FlowEdge,
): Omit<Choice, "id" | "createdAt" | "updatedAt"> => ({
  choiceText: edge.data.choiceText,
  fromNodeId: parseInt(edge.source),
  toNodeId: parseInt(edge.target),
});

export const createTemporaryEdge = (
  sourceNodeId: number,
  targetNodeId: number,
  choiceText: string,
): FlowEdge => ({
  id: `temp-edge-${nanoid()}`,
  source: sourceNodeId.toString(),
  target: targetNodeId.toString(),
  label: choiceText,
  data: {
    choiceText,
    isTemporary: true,
  },
});

export const createTemporaryNode = (
  position: { x: number; y: number },
  storyId: number,
  title: string = "Новый узел",
): FlowNode => {
  const tempId = -Date.now();

  return {
    id: tempId,
    picture: "",
    title,
    content: "Опишите содержимое узла...",
    isStart: false,
    isEnd: false,
    storyId,
    position, 
    type: "normal",
  };
};

export const isTemporaryNode = (nodeId: number | string): boolean => {
  if (typeof nodeId === "string") {
    return nodeId.startsWith("temp-");
  }
  return nodeId < 0;
};

export const isTemporaryEdge = (edgeId: string): boolean =>
  edgeId.startsWith("temp-edge-");
