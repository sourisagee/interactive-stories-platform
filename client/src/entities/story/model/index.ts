import type { User } from "../../user/model";

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
  createdAt?: string;
  updatedAt?: string;
}

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
  variables?: null; // если будем добавлять -- поменять тип
  userId: number;
  storyId: number;
  currentNodeId: number;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
}

// типы для React Flow

// узел для флоу
// наследует, но вместо position_x + position_y использует position
export interface FlowNode extends Omit<StoryNode, "position_x" | "position_y"> {
  position: { x: number; y: number };
  type?: "start" | "normal" | "end" | "custom";
}

// связь для флоу (в бд -- Choice)
export interface FlowEdge {
  id: string; //  string для React Flow (edge-{choice.id})
  source: string; // ID узла как строка
  target: string; // ID узла как строка
  label?: string;
  data: {
    choiceId?: number; // ID из БД, если сохранен
    choiceText: string;
    isTemporary?: boolean; // временная связь
  };
}

// для api ответов
export interface StoryWithNodes {
  story: Story;
  nodes: StoryNode[];
  choices: Choice[];
}

// для состояния редактора

export interface StoryEditorState {
  // Данные
  currentStory: Story | null;
  nodes: FlowNode[];
  edges: FlowEdge[];

  // Состояние UI
  selectedNodeId: number | null;
  selectedEdgeId: string | null;

  // Загрузка/сохранение
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Панель свойств
  isPropertiesPanelOpen: boolean;

  // Масштаб и положение канваса
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

// для форм

export interface CreateStoryFormData {
  title: string;
  genre: string;
  description: string;
  cover: string;
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

// для событий флоу

export interface NodePositionUpdate {
  nodeId: number;
  position: { x: number; y: number };
}

export interface EdgeLabelUpdate {
  edgeId: string;
  label: string;
}