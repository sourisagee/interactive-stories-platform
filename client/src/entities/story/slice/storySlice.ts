import { createSlice } from "@reduxjs/toolkit";
import {
  getAllStoriesThunk,
  getStoryByIdThunk,
  getStoryFullThunk,
  createStoryThunk,
  getMyStoriesThunk,
} from "../api/StoryApi";
import { initialStoriesState } from "../model";

const storySlice = createSlice({
  name: "stories", 
  initialState: initialStoriesState,
  reducers: {
    setCurrentStory: (state, action) => {
      state.currentStory = action.payload;
    },

    clearCurrentStory: (state) => {
      state.currentStory = null;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllStoriesThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getAllStoriesThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.stories = action.payload; 
      state.error = null;
    });
    builder.addCase(getAllStoriesThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string; 
    });

    builder.addCase(getStoryByIdThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getStoryByIdThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentStory = action.payload; 
      state.error = null;
    });
    builder.addCase(getStoryByIdThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(getStoryFullThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getStoryFullThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentStory = action.payload; 
      state.error = null;
    });
    builder.addCase(getStoryFullThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(createStoryThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createStoryThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.stories.unshift(action.payload);
      state.currentStory = action.payload; 
      state.error = null;
    });
    builder.addCase(createStoryThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(getMyStoriesThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getMyStoriesThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.stories = action.payload; 
      state.error = null;
    });
    builder.addCase(getMyStoriesThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setCurrentStory, clearCurrentStory, clearError } =
  storySlice.actions;

export const storyReducer = storySlice.reducer;
