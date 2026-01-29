import type { StoryNode, Choice, FlowNode, FlowEdge } from "./index";
import { nanoid } from "nanoid";

/**
 * Конвертирует StoryNode из БД в FlowNode для React Flow
 */
export const convertToFlowNode = (node: StoryNode): FlowNode => ({
  ...node,
  position: { x: node.position_x, y: node.position_y },
  type: node.isStart ? "start" : node.isEnd ? "end" : "normal",
});

/**
 * Конвертирует FlowNode обратно в StoryNode для отправки в БД
 */
export const convertFromFlowNode = (flowNode: FlowNode): StoryNode => ({
  ...flowNode,
  position_x: flowNode.position.x,
  position_y: flowNode.position.y,
});

/**
 * Конвертирует Choice из БД в FlowEdge для React Flow
 */
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

/**
 * Конвертирует FlowEdge обратно в Choice для отправки в БД
 */
export const convertFromFlowEdge = (
  edge: FlowEdge,
): Omit<Choice, "id" | "createdAt" | "updatedAt"> => ({
  choiceText: edge.data.choiceText,
  fromNodeId: parseInt(edge.source),
  toNodeId: parseInt(edge.target),
});

/**
 * Создает временный FlowEdge (перед сохранением в БД)
 */
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

/**
 * Создает временный FlowNode (перед сохранением в БД)
 */
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

/**
 * Проверяет, является ли узел временным (имеет отрицательный ID)
 */
export const isTemporaryNode = (nodeId: number | string): boolean => {
  if (typeof nodeId === "string") {
    return nodeId.startsWith("temp-");
  }
  return nodeId < 0;
};

/**
 * Проверяет, является ли связь временной
 */
export const isTemporaryEdge = (edgeId: string): boolean =>
  edgeId.startsWith("temp-edge-");
