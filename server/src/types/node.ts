import { Node, Choice } from "@prisma/client";

// Базовые типы для создания и обновления Node
export interface CreateNodeDto {
  title: string;
  content: string;
  isStart?: boolean;
  isEnd?: boolean;
  storyId: number;
}

export interface UpdateNodeDto {
  title?: string;
  content?: string;
  isStart?: boolean;
  isEnd?: boolean;
}

// Расширенные типы с включенными связями
export interface NodeWithChoices extends Node {
  fromChoices: Choice[];
  toChoices: Choice[];
}
