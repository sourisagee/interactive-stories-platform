import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../shared/lib/axiosInstance";
import type { ServerResponseType } from "../../../shared/types";
import type { AxiosError } from "axios";

export interface StoryRatingInfo {
  averageRating: number;
  totalRatings: number;
  userRating: number | null;
}

import type { StoryData } from "../../story/model";

export interface PopularStory extends StoryData {
  averageRating: number;
  totalRatings: number;
}

const API_RATINGS_URL = "/stories";

const handleApiError = (error: unknown, defaultMessage: string): string => {
  const axiosError = error as AxiosError<ServerResponseType<null>>;
  return (
    axiosError.response?.data?.message ||
    axiosError.message ||
    defaultMessage
  );
};

export default class RatingApi {
  static async getStoryRating(
    storyId: number
  ): Promise<StoryRatingInfo> {
    const response = await axiosInstance.get<
      ServerResponseType<StoryRatingInfo>
    >(`${API_RATINGS_URL}/${storyId}/rating`);
    return response.data.data as StoryRatingInfo;
  }

  static async createOrUpdateRating(
    storyId: number,
    rating: number
  ): Promise<StoryRatingInfo> {
    const response = await axiosInstance.post<
      ServerResponseType<StoryRatingInfo>
    >(`${API_RATINGS_URL}/${storyId}/rating`, { rating });
    return response.data.data as StoryRatingInfo;
  }

  static async deleteRating(storyId: number): Promise<StoryRatingInfo> {
    const response = await axiosInstance.delete<
      ServerResponseType<StoryRatingInfo>
    >(`${API_RATINGS_URL}/${storyId}/rating`);
    return response.data.data as StoryRatingInfo;
  }

  static async getPopularStories(limit: number = 4): Promise<PopularStory[]> {
    const response = await axiosInstance.get<
      ServerResponseType<PopularStory[]>
    >(`${API_RATINGS_URL}/popular?limit=${limit}`);
    return response.data.data || [];
  }
}

// THUNK'И ДЛЯ REDUX

export const getStoryRatingThunk = createAsyncThunk<
  StoryRatingInfo,
  number,
  { rejectValue: string }
>(
  "rating/getStoryRating",
  async (storyId, { rejectWithValue }) => {
    try {
      return await RatingApi.getStoryRating(storyId);
    } catch (error) {
      const axiosError = error as AxiosError<ServerResponseType<null>>;
      // Если история не найдена (404) или неверный запрос (400), возвращаем дефолтный рейтинг
      if (axiosError.response?.status === 404 || axiosError.response?.status === 400) {
        return {
          averageRating: 0,
          totalRatings: 0,
          userRating: null,
        };
      }
      const errorMessage = handleApiError(
        error,
        "Не удалось загрузить рейтинг"
      );
      return rejectWithValue(errorMessage);
    }
  }
);

export const createOrUpdateRatingThunk = createAsyncThunk<
  StoryRatingInfo,
  { storyId: number; rating: number },
  { rejectValue: string }
>(
  "rating/createOrUpdateRating",
  async ({ storyId, rating }, { rejectWithValue }) => {
    try {
      return await RatingApi.createOrUpdateRating(storyId, rating);
    } catch (error) {
      const errorMessage = handleApiError(
        error,
        "Не удалось поставить оценку"
      );
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteRatingThunk = createAsyncThunk<
  StoryRatingInfo,
  number,
  { rejectValue: string }
>("rating/deleteRating", async (storyId, { rejectWithValue }) => {
  try {
    return await RatingApi.deleteRating(storyId);
  } catch (error) {
    const errorMessage = handleApiError(error, "Не удалось удалить оценку");
    return rejectWithValue(errorMessage);
  }
});

export const getPopularStoriesThunk = createAsyncThunk<
  PopularStory[],
  number | undefined,
  { rejectValue: string }
>(
  "rating/getPopularStories",
  async (limit, { rejectWithValue }) => {
    try {
      return await RatingApi.getPopularStories(limit || 4);
    } catch (error) {
      const errorMessage = handleApiError(
        error,
        "Не удалось загрузить популярные истории"
      );
      return rejectWithValue(errorMessage);
    }
  }
);
