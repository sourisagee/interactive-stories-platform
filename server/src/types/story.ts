import { Story, Node, Choice, User } from "@prisma/client";

// Базовые типы для создания и обновления Story
export interface CreateStoryDto {
  title: string;
  genre: string;
  authorName: string;
  description: string;
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

// Фильтры для поиска историй
export interface StoryFilters {
  genre?: string;
  isPublished?: boolean;
  authorId?: number;
  search?: string; // Поиск по title или description
}

// Параметры пагинации
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
}

// Результат с пагинацией
export interface PaginatedStories {
  stories: Story[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Статистика по историям
export interface StoryStats {
  totalStories: number;
  publishedStories: number;
  draftStories: number;
  storiesByGenre: { genre: string; count: number }[];
}
