import { createSlice } from "@reduxjs/toolkit";
import {
  getAllStoriesThunk,
  getStoryByIdThunk,
  getStoryFullThunk,
  createStoryThunk,
  getMyStoriesThunk,
} from "../api/StoryApi";
import { initialStoriesState } from "../model";

// storySlice - создает "срез" (slice) состояния для историй
const storySlice = createSlice({
  name: "stories", // Имя slice в Redux store
  initialState: initialStoriesState, // Начальное состояние из model
  reducers: {
    // Синхронные действия для управления текущей историей
    // Устанавливает текущую выбранную историю
    setCurrentStory: (state, action) => {
      state.currentStory = action.payload;
    },
    // Очищает текущую выбранную историю
    clearCurrentStory: (state) => {
      state.currentStory = null;
    },
    // Очищает ошибки
    clearError: (state) => {
      state.error = null;
    },
  },
  // extraReducers - здесь обрабатываются ВСЕ асинхронные actions от thunk'ов
  extraReducers: (builder) => {
    // ========== getAllStoriesThunk - Получение списка всех историй ==========
    builder.addCase(getAllStoriesThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getAllStoriesThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.stories = action.payload; // Сохраняем полученный массив историй
      state.error = null;
    });
    builder.addCase(getAllStoriesThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string; // Сохраняем сообщение об ошибке
    });

    // ========== getStoryByIdThunk - Получение истории по ID ==========
    builder.addCase(getStoryByIdThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getStoryByIdThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentStory = action.payload; // Сохраняем полученную историю как текущую
      state.error = null;
    });
    builder.addCase(getStoryByIdThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // ========== getStoryFullThunk - Получение полной истории с узлами ==========
    builder.addCase(getStoryFullThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getStoryFullThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentStory = action.payload; // Сохраняем полную историю как текущую
      state.error = null;
    });
    builder.addCase(getStoryFullThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // ========== createStoryThunk - Создание новой истории ==========
    builder.addCase(createStoryThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createStoryThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      // Добавляем созданную историю в начало списка
      state.stories.unshift(action.payload);
      state.currentStory = action.payload; // Устанавливаем созданную историю как текущую
      state.error = null;
    });
    builder.addCase(createStoryThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // ========== getMyStoriesThunk - Получение моих историй ==========
    builder.addCase(getMyStoriesThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getMyStoriesThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.stories = action.payload; // Сохраняем массив историй пользователя
      state.error = null;
    });
    builder.addCase(getMyStoriesThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

// Экспортируем actions (синхронные действия)
export const { setCurrentStory, clearCurrentStory, clearError } =
  storySlice.actions;

// Экспортируем reducer для подключения в store
export const storyReducer = storySlice.reducer;
