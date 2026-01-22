import { Story, Node, Choice, User } from "@prisma/client";

// Базовые типы для создания и обновления Story
export interface CreateStoryDto {
  title: string;
  genre: string;
  authorName: string;
  description: string;
  isPublished?: boolean;
  authorId: number;
}

export interface UpdateStoryDto {
  title?: string;
  genre?: string;
  authorName?: string;
  description?: string;
  isPublished?: boolean;
}

// Расширенные типы с включенными связями
export interface StoryWithAuthor extends Story {
  author: User;
}

export interface StoryWithNodes extends Story {
  nodes: Node[];
}

export interface StoryFull extends Story {
  author: User;
  nodes: (Node & {
    fromChoices: Choice[];
    toChoices: Choice[];
  })[];
}
