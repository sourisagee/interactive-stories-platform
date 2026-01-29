import { Node, Choice } from "@prisma/client";

export interface CreateNodeDto {
  title: string;
  content: string;
  picture: string;
  position_x: number;
  position_y: number;
  isStart?: boolean;
  isEnd?: boolean;
  storyId: number;
}

export interface UpdateNodeDto {
  title?: string;
  content?: string;
  picture?: string;
  position_x?: number;
  position_y?: number;
  isStart?: boolean;
  isEnd?: boolean;
}

export interface NodeWithChoices extends Node {
  fromChoices: Choice[];
  toChoices: Choice[];
}
