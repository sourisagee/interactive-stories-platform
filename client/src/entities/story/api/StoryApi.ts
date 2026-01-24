import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../shared/lib/axiosInstance";
import type { 
  Story, 
  StoryNode, 
  Choice, 
  StoryWithNodes,
  CreateStoryFormData,
  UpdateNodeFormData,
  CreateChoiceFormData
} from "../model";
import type { ServerResponseType } from "../../../shared/types";
import type { AxiosError } from "axios";

// Базовые URL для API
const API_STORIES_URL = "/stories";
const API_NODES_URL = "/nodes";
const API_CHOICES_URL = "/choices";

// Уникальные имена 
export const STORY_THUNK_NAMES = {
  // Story
  CREATE_STORY: "story/createStory",
  GET_STORY: "story/getStory",
  GET_FULL_STORY: "story/getFullStory",
  UPDATE_STORY: "story/updateStory",
  DELETE_STORY: "story/deleteStory",
  GET_USER_STORIES: "story/getUserStories",
  GET_STORY_CHOICES: "story/getStoryChoices",
  
  // Nodes
  CREATE_NODE: "story/createNode",
  UPDATE_NODE: "story/updateNode",
  DELETE_NODE: "story/deleteNode",
  
  // Choices
  CREATE_CHOICE: "story/createChoice",
  UPDATE_CHOICE: "story/updateChoice",
  DELETE_CHOICE: "story/deleteChoice",
} as const;

/**
 * Создание новой истории
 */
export const createStoryThunk = createAsyncThunk<
  Story,
  CreateStoryFormData,
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.CREATE_STORY,
  async (storyData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<
        ServerResponseType<Story>
      >(API_STORIES_URL, storyData);
      
      return response.data.data as Story;
    } catch (error) {
      const axiosError = error as AxiosError<ServerResponseType<null>>;
      const errorMessage = axiosError.response?.data?.message || 
                          axiosError.message || 
                          "Не удалось создать историю";
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Получение истории с узлами и выборами (для редактора)
 */
export const getFullStoryThunk = createAsyncThunk<
  StoryWithNodes,
  number,
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.GET_FULL_STORY,
  async (storyId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<
        ServerResponseType<StoryWithNodes>
      >(`${API_STORIES_URL}/${storyId}/full`);
      
      return response.data.data as StoryWithNodes;
    } catch (error) {
      const axiosError = error as AxiosError<ServerResponseType<null>>;
      const errorMessage = axiosError.response?.data?.message || 
                          axiosError.message || 
                          "Не удалось загрузить историю";
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Получение всех выборов для истории (нужно для загрузки полного графа)
 */
export const getStoryChoicesThunk = createAsyncThunk<
  Choice[],
  number,
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.GET_STORY_CHOICES,
  async (storyId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<
        ServerResponseType<Choice[]>
      >(`${API_CHOICES_URL}/story/${storyId}`);
      
      return response.data.data as Choice[];
    } catch (error) {
      const axiosError = error as AxiosError<ServerResponseType<null>>;
      const errorMessage = axiosError.response?.data?.message || 
                          axiosError.message || 
                          "Не удалось загрузить выборы истории";
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Обновление истории (название, описание, обложка)
 */
export const updateStoryThunk = createAsyncThunk<
  Story,
  { storyId: number; updates: Partial<Story> },
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.UPDATE_STORY,
  async ({ storyId, updates }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<
        ServerResponseType<Story>
      >(`${API_STORIES_URL}/${storyId}`, updates);
      
      return response.data.data as Story;
    } catch (error) {
      const axiosError = error as AxiosError<ServerResponseType<null>>;
      const errorMessage = axiosError.response?.data?.message || 
                          axiosError.message || 
                          "Не удалось обновить историю";
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Получение всех историй пользователя
 */
export const getUserStoriesThunk = createAsyncThunk<
  Story[],
  void,
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.GET_USER_STORIES,
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<
        ServerResponseType<Story[]>
      >(`${API_STORIES_URL}/my/stories`);
      
      return response.data.data as Story[];
    } catch (error) {
      const axiosError = error as AxiosError<ServerResponseType<null>>;
      const errorMessage = axiosError.response?.data?.message || 
                          axiosError.message || 
                          "Не удалось загрузить истории";
      return rejectWithValue(errorMessage);
    }
  }
);

// ==================== THUNK'И ДЛЯ NODES ====================

/**
 * Создание нового узла
 */
export const createNodeThunk = createAsyncThunk<
  StoryNode,
  {
    storyId: number;
    title: string;
    content: string;
    picture?: string;
    isStart?: boolean;
    isEnd?: boolean;
    position_x: number;
    position_y: number;
  },
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.CREATE_NODE,
  async (nodeData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<
        ServerResponseType<StoryNode>
      >(API_NODES_URL, nodeData);
      
      return response.data.data as StoryNode;
    } catch (error) {
      const axiosError = error as AxiosError<ServerResponseType<null>>;
      const errorMessage = axiosError.response?.data?.message || 
                          axiosError.message || 
                          "Не удалось создать узел";
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Обновление узла
 */
export const updateNodeThunk = createAsyncThunk<
  StoryNode,
  { nodeId: number; updates: UpdateNodeFormData },
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.UPDATE_NODE,
  async ({ nodeId, updates }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<
        ServerResponseType<StoryNode>
      >(`${API_NODES_URL}/${nodeId}`, updates);
      
      return response.data.data as StoryNode;
    } catch (error) {
      const axiosError = error as AxiosError<ServerResponseType<null>>;
      const errorMessage = axiosError.response?.data?.message || 
                          axiosError.message || 
                          "Не удалось обновить узел";
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Удаление узла
 */
export const deleteNodeThunk = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.DELETE_NODE,
  async (nodeId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete<
        ServerResponseType<null>
      >(`${API_NODES_URL}/${nodeId}`);
      
      return nodeId;
    } catch (error) {
      const axiosError = error as AxiosError<ServerResponseType<null>>;
      const errorMessage = axiosError.response?.data?.message || 
                          axiosError.message || 
                          "Не удалось удалить узел";
      return rejectWithValue(errorMessage);
    }
  }
);

// ==================== THUNK'И ДЛЯ CHOICES ====================

/**
 * Создание выбора (связи между узлами)
 */
export const createChoiceThunk = createAsyncThunk<
  Choice,
  CreateChoiceFormData,
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.CREATE_CHOICE,
  async (choiceData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<
        ServerResponseType<Choice>
      >(API_CHOICES_URL, choiceData);
      
      return response.data.data as Choice;
    } catch (error) {
      const axiosError = error as AxiosError<ServerResponseType<null>>;
      const errorMessage = axiosError.response?.data?.message || 
                          axiosError.message || 
                          "Не удалось создать выбор";
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Обновление текста выбора
 */
export const updateChoiceThunk = createAsyncThunk<
  Choice,
  { choiceId: number; choiceText: string },
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.UPDATE_CHOICE,
  async ({ choiceId, choiceText }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<
        ServerResponseType<Choice>
      >(`${API_CHOICES_URL}/${choiceId}`, { choiceText });
      
      return response.data.data as Choice;
    } catch (error) {
      const axiosError = error as AxiosError<ServerResponseType<null>>;
      const errorMessage = axiosError.response?.data?.message || 
                          axiosError.message || 
                          "Не удалось обновить выбор";
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Удаление выбора
 */
export const deleteChoiceThunk = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.DELETE_CHOICE,
  async (choiceId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete<
        ServerResponseType<null>
      >(`${API_CHOICES_URL}/${choiceId}`);
      
      return choiceId;
    } catch (error) {
      const axiosError = error as AxiosError<ServerResponseType<null>>;
      const errorMessage = axiosError.response?.data?.message || 
                          axiosError.message || 
                          "Не удалось удалить выбор";
      return rejectWithValue(errorMessage);
    }
  }
);