import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "../../entities/user/slice/userSlice";
import { storyReducer } from "../../entities/story/slice/storySlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    stories: storyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;