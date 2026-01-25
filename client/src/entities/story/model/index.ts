export type StoryData = {
  id: number;
  cover: string;
  title: string;
  genre: string;
  authorName: string;
  description: string;
  isPublished: boolean;
  authorId: number;
  createdAt: string;
  updatedAt: string;
};

/** Выбор в узле истории; toNodeId — следующий узел */
export type ChoiceData = {
  id: number;
  choiceText: string;
  toNodeId: number;
};

/** Узел истории: картинка, текст, выборы (fromChoices), isStart/isEnd */
export type NodeData = {
  id: number;
  title: string;
  content: string;
  picture: string;
  isStart: boolean;
  isEnd: boolean;
  fromChoices: ChoiceData[];
};

/** История с узлами для страницы игры (GET /stories/:id/full) */
export type StoryFullData = StoryData & { nodes: NodeData[] };

export type StoryType = {
  story: StoryData | null;
};

// для списка историй
export type StoriesListType = StoryData[];

// Тип для ответа API при получении списка историй
export type StoriesResponseType = {
  stories: StoryData[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

// Тип для формы создания истории
export type CreateStoryFormData = {
  title: string;
  genre: string;
  authorName: string;
  description: string;
  cover: string;
};

// Состояние для  slice
export type StoriesStateType = {
  stories: StoryData[];
  currentStory: StoryData | null; // Текущая выбранная история
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
};

// Начальное состояние для Redux
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
  story: StoryData | null;
  isLoading: boolean;
  error: string | null;
};

// Нач состояние для одной истории
export const initialStoryState: StoryStateType = {
  story: null,
  isLoading: false,
  error: null,
};
