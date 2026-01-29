import { Story, Node, Choice, User } from "@prisma/client";

export interface CreateStoryDto {
  title: string;
  genre: string;
  authorName: string;
  description: string;
  cover: string;
  authorId: number;
}

export interface UpdateStoryDto {
  title?: string;
  genre?: string;
  authorName?: string;
  description?: string;
  cover?: string;
  isPublished?: boolean;
}

export interface StoryWithAuthor extends Story {
  author: User;
}

export interface StoryFull extends Story {
  author: User;
  nodes: (Node & {
    fromChoices: Choice[];
    toChoices: Choice[];
  })[];
}
