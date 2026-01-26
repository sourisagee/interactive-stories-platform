import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "../../entities/user/slice/userSlice";
import { storyEditorReducer } from "../../entities/story/slice/storyEditorSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    storyEditor: storyEditorReducer,
  },

  // Настройка middleware для работы с несериализуемыми данными
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем эти пути, так как React Flow nodes/edges могут содержать
        // несериализуемые данные (например, функции или React компоненты)
        ignoredPaths: ["storyEditor.nodes", "storyEditor.edges"],
        // Игнорируем эти actions (если они содержат несериализуемые данные)
        ignoredActions: [
          "storyEditor/addNode",
          "storyEditor/updateNode",
          "storyEditor/addEdge",
          "storyEditor/updateEdge",
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
