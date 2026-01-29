import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../shared/lib/axiosInstance";
import type {
  Story,
  StoryNode,
  Choice,
  StoryWithNodes,
  CreateStoryFormData,
  UpdateNodeFormData,
  CreateChoiceFormData,
  StoryData,
  StoryFullData
} from "../model";
import type { ServerResponseType } from "../../../shared/types";
import type { AxiosError } from "axios";

const API_STORIES_URL = "/stories";
const API_NODES_URL = "/nodes";
const API_CHOICES_URL = "/choices";

export const STORY_THUNK_NAMES = {
  // Story
  GET_ALL_STORIES: "story/getAllStories",
  GET_STORY_BY_ID: "story/getStoryById",
  GET_STORY_FULL: "story/getStoryFull",
  CREATE_STORY: "story/createStory",
  GET_MY_STORIES: "story/getMyStories",
  UPDATE_STORY: "story/updateStory",
  DELETE_STORY: "story/deleteStory",
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

const handleApiError = (error: unknown, defaultMessage: string): string => {
  const axiosError = error as AxiosError<ServerResponseType<null>>;
  return axiosError.response?.data?.message ||
         axiosError.message ||
         defaultMessage;
};

export default class StoryApi {
  static async getAllStories(authorId?: number): Promise<StoryData[]> {
    const url = authorId
      ? `${API_STORIES_URL}?author=${authorId}`
      : API_STORIES_URL;
    const response = await axiosInstance.get<ServerResponseType<StoryData[]>>(url);
    return response.data.data || [];
  }

  static async getStoryById(storyId: number): Promise<StoryData> {
    const response = await axiosInstance.get<ServerResponseType<StoryData>>(
      `${API_STORIES_URL}/${storyId}`
    );
    return response.data.data as StoryData;
  }

  static async getStoryFull(storyId: number): Promise<StoryFullData> {
    const response = await axiosInstance.get<ServerResponseType<StoryFullData>>(
      `${API_STORIES_URL}/${storyId}/full`
    );
    return response.data.data as StoryFullData;
  }

  static async createStory(storyData: CreateStoryFormData): Promise<StoryData> {
    const response = await axiosInstance.post<ServerResponseType<StoryData>>(
      API_STORIES_URL,
      storyData
    );
    return response.data.data as StoryData;
  }

  static async getMyStories(): Promise<StoryData[]> {
    const response = await axiosInstance.get<ServerResponseType<StoryData[]>>(
      `${API_STORIES_URL}/my/stories`
    );
    return response.data.data || [];
  }

  static async getFullStory(storyId: number): Promise<StoryWithNodes> {
    const response = await axiosInstance.get<ServerResponseType<StoryWithNodes>>(
      `${API_STORIES_URL}/${storyId}/full`
    );
    return response.data.data as StoryWithNodes;
  }

  static async getStoryChoices(storyId: number): Promise<Choice[]> {
    const response = await axiosInstance.get<ServerResponseType<Choice[]>>(
      `${API_CHOICES_URL}/story/${storyId}`
    );
    return response.data.data as Choice[];
  }

  static async updateStory(storyId: number, updates: Partial<Story>): Promise<Story> {
    const response = await axiosInstance.put<ServerResponseType<Story>>(
      `${API_STORIES_URL}/${storyId}`,
      updates
    );
    return response.data.data as Story;
  }

  static async createNode(nodeData: {
    storyId: number;
    title: string;
    content: string;
    picture?: string;
    isStart?: boolean;
    isEnd?: boolean;
    position_x: number;
    position_y: number;
  }): Promise<StoryNode> {
    const response = await axiosInstance.post<ServerResponseType<StoryNode>>(
      API_NODES_URL,
      nodeData
    );
    return response.data.data as StoryNode;
  }

  static async updateNode(nodeId: number, updates: UpdateNodeFormData): Promise<StoryNode> {
    const response = await axiosInstance.put<ServerResponseType<StoryNode>>(
      `${API_NODES_URL}/${nodeId}`,
      updates
    );
    return response.data.data as StoryNode;
  }

  static async deleteNode(nodeId: number): Promise<void> {
    await axiosInstance.delete(`${API_NODES_URL}/${nodeId}`);
  }

  static async createChoice(choiceData: CreateChoiceFormData): Promise<Choice> {
    const response = await axiosInstance.post<ServerResponseType<Choice>>(
      API_CHOICES_URL,
      choiceData
    );
    return response.data.data as Choice;
  }

  static async updateChoice(choiceId: number, choiceText: string): Promise<Choice> {
    const response = await axiosInstance.put<ServerResponseType<Choice>>(
      `${API_CHOICES_URL}/${choiceId}`,
      { choiceText }
    );
    return response.data.data as Choice;
  }

  static async deleteChoice(choiceId: number): Promise<void> {
    await axiosInstance.delete(`${API_CHOICES_URL}/${choiceId}`);
  }
}

// THUNK'И ДЛЯ REDUX

export const getAllStoriesThunk = createAsyncThunk<
  StoryData[],
  number | undefined,
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.GET_ALL_STORIES,
  async (authorId, { rejectWithValue }) => {
    try {
      return await StoryApi.getAllStories(authorId);
    } catch (error) {
      const errorMessage = handleApiError(error, "Не удалось загрузить истории");
      return rejectWithValue(errorMessage);
    }
  }
);

export const getStoryByIdThunk = createAsyncThunk<
  StoryData,
  number,
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.GET_STORY_BY_ID,
  async (storyId, { rejectWithValue }) => {
    try {
      return await StoryApi.getStoryById(storyId);
    } catch (error) {
      const errorMessage = handleApiError(error, "Не удалось загрузить историю");
      return rejectWithValue(errorMessage);
    }
  }
);

export const getStoryFullThunk = createAsyncThunk<
  StoryFullData,
  number,
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.GET_STORY_FULL,
  async (storyId, { rejectWithValue }) => {
    try {
      return await StoryApi.getStoryFull(storyId);
    } catch (error) {
      const errorMessage = handleApiError(error, "Не удалось загрузить полную историю");
      return rejectWithValue(errorMessage);
    }
  }
);

export const createStoryThunk = createAsyncThunk<
  StoryData,
  CreateStoryFormData,
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.CREATE_STORY,
  async (storyData, { rejectWithValue }) => {
    try {
      return await StoryApi.createStory(storyData);
    } catch (error) {
      const errorMessage = handleApiError(error, "Не удалось создать историю");
      return rejectWithValue(errorMessage);
    }
  }
);

export const getMyStoriesThunk = createAsyncThunk<
  StoryData[],
  void,
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.GET_MY_STORIES,
  async (_, { rejectWithValue }) => {
    try {
      return await StoryApi.getMyStories();
    } catch (error) {
      const errorMessage = handleApiError(error, "Не удалось загрузить ваши истории");
      return rejectWithValue(errorMessage);
    }
  }
);

export const getFullStoryThunk = createAsyncThunk<
  StoryWithNodes,
  number,
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.GET_STORY_FULL,
  async (storyId, { rejectWithValue }) => {
    try {
      return await StoryApi.getFullStory(storyId);
    } catch (error) {
      const errorMessage = handleApiError(error, "Не удалось загрузить историю");
      return rejectWithValue(errorMessage);
    }
  }
);

export const getStoryChoicesThunk = createAsyncThunk<
  Choice[],
  number,
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.GET_STORY_CHOICES,
  async (storyId, { rejectWithValue }) => {
    try {
      return await StoryApi.getStoryChoices(storyId);
    } catch (error) {
      const errorMessage = handleApiError(error, "Не удалось загрузить выборы истории");
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateStoryThunk = createAsyncThunk<
  Story,
  { storyId: number; updates: Partial<Story> },
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.UPDATE_STORY,
  async ({ storyId, updates }, { rejectWithValue }) => {
    try {
      return await StoryApi.updateStory(storyId, updates);
    } catch (error) {
      const errorMessage = handleApiError(error, "Не удалось обновить историю");
      return rejectWithValue(errorMessage);
    }
  }
);

export const createNodeThunk = createAsyncThunk<
  StoryNode,
  {
    nodeData: {
      storyId: number;
      title: string;
      content: string;
      picture?: string;
      isStart?: boolean;
      isEnd?: boolean;
      position_x: number;
      position_y: number;
    };
    temporaryNodeId?: number;
  },
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.CREATE_NODE,
  async ({ nodeData }, { rejectWithValue }) => {
    try {
      return await StoryApi.createNode(nodeData);
    } catch (error) {
      const errorMessage = handleApiError(error, "Не удалось создать узел");
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateNodeThunk = createAsyncThunk<
  StoryNode,
  { nodeId: number; updates: UpdateNodeFormData },
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.UPDATE_NODE,
  async ({ nodeId, updates }, { rejectWithValue }) => {
    try {
      return await StoryApi.updateNode(nodeId, updates);
    } catch (error) {
      const errorMessage = handleApiError(error, "Не удалось обновить узел");
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteNodeThunk = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.DELETE_NODE,
  async (nodeId, { rejectWithValue }) => {
    try {
      await StoryApi.deleteNode(nodeId);
      return nodeId;
    } catch (error) {
      const errorMessage = handleApiError(error, "Не удалось удалить узел");
      return rejectWithValue(errorMessage);
    }
  }
);

export const createChoiceThunk = createAsyncThunk<
  Choice,
  CreateChoiceFormData,
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.CREATE_CHOICE,
  async (choiceData, { rejectWithValue }) => {
    try {
      return await StoryApi.createChoice(choiceData);
    } catch (error) {
      const errorMessage = handleApiError(error, "Не удалось создать выбор");
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateChoiceThunk = createAsyncThunk<
  Choice,
  { choiceId: number; choiceText: string },
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.UPDATE_CHOICE,
  async ({ choiceId, choiceText }, { rejectWithValue }) => {
    try {
      return await StoryApi.updateChoice(choiceId, choiceText);
    } catch (error) {
      const errorMessage = handleApiError(error, "Не удалось обновить выбор");
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteChoiceThunk = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  STORY_THUNK_NAMES.DELETE_CHOICE,
  async (choiceId, { rejectWithValue }) => {
    try {
      await StoryApi.deleteChoice(choiceId);
      return choiceId;
    } catch (error) {
      const errorMessage = handleApiError(error, "Не удалось удалить выбор");
      return rejectWithValue(errorMessage);
    }
  }
);

 