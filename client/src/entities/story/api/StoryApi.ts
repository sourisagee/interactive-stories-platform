import { axiosInstance } from "../../../shared/lib/axiosInstance";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type {
  StoryData,
  CreateStoryFormData,
} from "../model";
import type { ServerResponseType } from "../../../shared/types";
import type { AxiosError } from "axios";

// Базовый URL для API историй
const API_STORIES_URL = "/stories";

// Класс StoryApi - содержит статические методы для работы с API историй
// Используется для прямых вызовов API без Redux (если нужно)
export default class StoryApi {
  // Получить все истории (публичный эндпоинт)
  // GET /api/stories?author=123 (опциональный query параметр для фильтрации по автору)
  static async getAllStories(authorId?: number) {
    const url = authorId
      ? `${API_STORIES_URL}?author=${authorId}`
      : API_STORIES_URL;
    const { data } = await axiosInstance.get(url);
    return data;
  }

  // Получить историю по ID (публичный эндпоинт)
  // GET /api/stories/:id
  static async getStoryById(storyId: number) {
    const { data } = await axiosInstance.get(`${API_STORIES_URL}/${storyId}`);
    return data;
  }

  // Получить полную историю с узлами и выборами (публичный эндпоинт)
  // GET /api/stories/:id/full
  static async getStoryFull(storyId: number) {
    const { data } = await axiosInstance.get(
      `${API_STORIES_URL}/${storyId}/full`,
    );
    return data;
  }

  // Создать новую историю (требует авторизации)
  // POST /api/stories
  static async createStory(storyData: CreateStoryFormData) {
    const { data } = await axiosInstance.post(API_STORIES_URL, storyData);
    return data;
  }

  // Получить мои истории (требует авторизации)
  // GET /api/stories/my/stories
  static async getMyStories() {
    const { data } = await axiosInstance.get(`${API_STORIES_URL}/my/stories`);
    return data;
  }
}

// STORY_THUNK_NAMES - Уникальные идентификаторы для действий (actions) в Redux store.
// Эти имена используются Redux для:
// 1. Автоматическое создания типов трех типов действий (начало, успех, ошибка)
// 2. Отслеживания в Redux DevTools
// 3. Организации логики в редьюсерах
const STORY_THUNK_NAMES = {
  GET_ALL_STORIES: "story/getAllStories",
  GET_STORY_BY_ID: "story/getStoryById",
  GET_STORY_FULL: "story/getStoryFull",
  CREATE_STORY: "story/createStory",
  GET_MY_STORIES: "story/getMyStories",
} as const;

// STORY_API_URL - URL эндпоинты для API запросов
const STORY_API_URL = {
  GET_ALL: "/stories",
  GET_BY_ID: (id: number) => `/stories/${id}`,
  GET_FULL: (id: number) => `/stories/${id}/full`,
  CREATE: "/stories",
  GET_MY_STORIES: "/stories/my/stories",
} as const;

// getAllStoriesThunk - Thunk для получения списка всех историй
// Может принимать опциональный authorId для фильтрации по автору
export const getAllStoriesThunk = createAsyncThunk<
  StoryData[], // Тип возвращаемого значения (массив историй)
  number | undefined, // Тип параметра (authorId или undefined)
  { rejectValue: string } // Тип ошибки
>(STORY_THUNK_NAMES.GET_ALL_STORIES, async (authorId, { rejectWithValue }) => {
  try {
    // Формируем URL с query параметром, если передан authorId
    const url = authorId
      ? `${STORY_API_URL.GET_ALL}?author=${authorId}`
      : STORY_API_URL.GET_ALL;

    const response =
      await axiosInstance.get<ServerResponseType<StoryData[]>>(url);

    // Возвращаем массив историй из ответа сервера
    return (response.data.data || []) as StoryData[];
  } catch (error) {
    // Обрабатываем ошибку и возвращаем сообщение об ошибке
    const axiosError = error as AxiosError<ServerResponseType<null>>;
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Unknown error";
    return rejectWithValue(errorMessage);
  }
});

// getStoryByIdThunk - Thunk для получения истории по ID
export const getStoryByIdThunk = createAsyncThunk<
  StoryData, // Тип возвращаемого значения (одна история)
  number, // Тип параметра (ID истории)
  { rejectValue: string }
>(STORY_THUNK_NAMES.GET_STORY_BY_ID, async (storyId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<ServerResponseType<StoryData>>(
      STORY_API_URL.GET_BY_ID(storyId),
    );

    // Возвращаем историю из ответа сервера
    return response.data.data as StoryData;
  } catch (error) {
    const axiosError = error as AxiosError<ServerResponseType<null>>;
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Unknown error";
    return rejectWithValue(errorMessage);
  }
});

// getStoryFullThunk - Thunk для получения полной истории с узлами и выборами
// Используется для отображения истории в редакторе или для игры
export const getStoryFullThunk = createAsyncThunk<
  StoryData, // Тип возвращаемого значения (полная история)
  number, // Тип параметра (ID истории)
  { rejectValue: string }
>(STORY_THUNK_NAMES.GET_STORY_FULL, async (storyId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<ServerResponseType<StoryData>>(
      STORY_API_URL.GET_FULL(storyId),
    );

    return response.data.data as StoryData;
  } catch (error) {
    const axiosError = error as AxiosError<ServerResponseType<null>>;
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Unknown error";
    return rejectWithValue(errorMessage);
  }
});

// санка для новой истории
export const createStoryThunk = createAsyncThunk<
  StoryData, // Тип возвращаемого значения (созданная история)
  CreateStoryFormData, // Тип параметра (данные для создания истории)
  { rejectValue: string }
>(STORY_THUNK_NAMES.CREATE_STORY, async (storyData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post<ServerResponseType<StoryData>>(
      STORY_API_URL.CREATE,
      storyData,
    );
    return response.data.data as StoryData;
  } catch (error) {
    const axiosError = error as AxiosError<ServerResponseType<null>>;
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Unknown error";
    return rejectWithValue(errorMessage);
  }
});

// санка для получения историй текущего пользователя (для профиля)
export const getMyStoriesThunk = createAsyncThunk<
  StoryData[], // Тип возвращаемого значения (массив историй пользователя)
  void, 
  { rejectValue: string }
>(STORY_THUNK_NAMES.GET_MY_STORIES, async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<ServerResponseType<StoryData[]>>(
      STORY_API_URL.GET_MY_STORIES,
    );

    return (response.data.data || []) as StoryData[];
  } catch (error) {
    const axiosError = error as AxiosError<ServerResponseType<null>>;
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Unknown error";
    return rejectWithValue(errorMessage);
  }
});
