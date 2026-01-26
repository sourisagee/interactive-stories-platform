import type { User } from "../../user/model";

// Базовый интерфейс истории
export interface Story {
  id: number;
  cover: string;
  title: string;
  genre: string;
  authorName: string;
  description: string;
  isPublished: boolean;
  authorId: number;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

// Алиас для совместимости
export type StoryData = Story;

export interface StoryNode {
  id: number;
  picture: string;
  title: string;
  content: string;
  isStart: boolean;
  isEnd: boolean;
  position_x: number;
  position_y: number;
  storyId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Choice {
  id: number;
  choiceText: string;
  fromNodeId: number;
  toNodeId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Playthrough {
  id: number;
  isCompleted: boolean;
  variables?: null;
  userId: number;
  storyId: number;
  currentNodeId: number;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
}

// Типы для React Flow
export interface FlowNode extends Omit<StoryNode, "position_x" | "position_y"> {
  position: { x: number; y: number };
  type?: "start" | "normal" | "end" | "custom";
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  data: {
    choiceId?: number;
    choiceText: string;
    isTemporary?: boolean;
  };
}

// Типы для API ответов
export interface StoryWithNodes {
  story: Story;
  nodes: StoryNode[];
  choices: Choice[];
}

// Узел с выборами для страницы игры
export interface NodeWithChoices extends StoryNode {
  fromChoices: Choice[];
}

// История с узлами для страницы игры (GET /stories/:id/full)
export type StoryFullData = Story & { nodes: NodeWithChoices[] };

// Типы для форм
export interface CreateStoryFormData {
  title: string;
  genre: string;
  description: string;
  cover: string;
  authorName: string;
}

export interface UpdateNodeFormData {
  title?: string;
  content?: string;
  picture?: string;
  isStart?: boolean;
  isEnd?: boolean;
}

export interface CreateChoiceFormData {
  choiceText: string;
  fromNodeId: number;
  toNodeId: number;
}

// Типы для состояний Redux
export type StoriesListType = Story[];

export type StoriesResponseType = {
  stories: Story[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

export type StoriesStateType = {
  stories: Story[];
  currentStory: Story | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
};

export const initialStoriesState: StoriesStateType = {
  stories: [],
  currentStory: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
};

// Состояние для одной истории
export type StoryStateType = {
  story: Story | null;
  isLoading: boolean;
  error: string | null;
};

export const initialStoryState: StoryStateType = {
  story: null,
  isLoading: false,
  error: null,
};

// Состояние редактора
export interface StoryEditorState {
  currentStory: Story | null;
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNodeId: number | null;
  selectedEdgeId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  isPropertiesPanelOpen: boolean;
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}

export const initialStoryEditorState: StoryEditorState = {
  currentStory: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  isLoading: false,
  isSaving: false,
  error: null,
  isPropertiesPanelOpen: true,
  viewport: {
    x: 0,
    y: 0,
    zoom: 1,
  },
};

// Типы для событий флоу
export interface NodePositionUpdate {
  nodeId: number;
  position: { x: number; y: number };
}

export interface EdgeLabelUpdate {
  edgeId: string;
  label: string;
}
