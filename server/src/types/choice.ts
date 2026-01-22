// import { Choice, Node, Story } from "@prisma/client";

export interface CreateChoiceData {
  choiceText: string;
  fromNodeId: number;
  toNodeId: number;
}

export interface UpdateChoiceData {
  choiceText?: string;
  fromNodeId?: number;
  toNodeId?: number;
}
