import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  getFullStoryThunk,
  createNodeThunk,
  updateNodeThunk,
  deleteNodeThunk,
  createChoiceThunk,
  updateChoiceThunk,
  deleteChoiceThunk,
  getStoryChoicesThunk,
} from "../api/StoryApi";
import {
  initialStoryEditorState,
  type FlowNode,
  type FlowEdge,
  type Story,
} from "../model";
import {
  convertToFlowNode,
  convertToFlowEdge,
  createTemporaryNode,
  createTemporaryEdge,
  isTemporaryNode,
  isTemporaryEdge,
} from "../model/converters";

const storyEditorSlice = createSlice({
  name: "storyEditor",
  initialState: initialStoryEditorState,
  reducers: {
    // ==================== СИНХРОННЫЕ ДЕЙСТВИЯ ====================

    /**
     * Установка текущей истории (без загрузки данных)
     */
    setCurrentStory: (state, action: PayloadAction<Story | null>) => {
      state.currentStory = action.payload;
    },

    /**
     * Синхронное добавление узла (для временных узлов)
     */
    addNode: (state, action: PayloadAction<FlowNode>) => {
      state.nodes.push(action.payload);
    },

    /**
     * Синхронное обновление узла
     */
    updateNode: (
      state,
      action: PayloadAction<{ id: number; updates: Partial<FlowNode> }>,
    ) => {
      const node = state.nodes.find((n) => n.id === action.payload.id);
      if (node) {
        Object.assign(node, action.payload.updates);
      }
    },

    /**
     * Синхронное удаление узла
     */
    deleteNode: (state, action: PayloadAction<number>) => {
      state.nodes = state.nodes.filter((node) => node.id !== action.payload);
      // Удаляем связанные связи
      state.edges = state.edges.filter(
        (edge) =>
          edge.source !== action.payload.toString() &&
          edge.target !== action.payload.toString(),
      );
    },

    /**
     * Синхронное добавление связи (для временных связей)
     */
    addEdge: (state, action: PayloadAction<FlowEdge>) => {
      state.edges.push(action.payload);
    },

    /**
     * Синхронное обновление связи
     */
    updateEdge: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<FlowEdge> }>,
    ) => {
      const edge = state.edges.find((e) => e.id === action.payload.id);
      if (edge) {
        Object.assign(edge, action.payload.updates);
      }
    },

    /**
     * Синхронное удаление связи
     */
    deleteEdge: (state, action: PayloadAction<string>) => {
      state.edges = state.edges.filter((edge) => edge.id !== action.payload);
    },

    /**
     * Выбор узла (снимает выбор с связи)
     */
    selectNode: (state, action: PayloadAction<number | null>) => {
      state.selectedNodeId = action.payload;
      state.selectedEdgeId = null;
    },

    /**
     * Выбор связи (снимает выбор с узла)
     */
    selectEdge: (state, action: PayloadAction<string | null>) => {
      state.selectedEdgeId = action.payload;
      state.selectedNodeId = null;
    },

    /**
     * Обновление позиции узла
     */
    updateNodePosition: (
      state,
      action: PayloadAction<{ id: number; position: { x: number; y: number } }>,
    ) => {
      const node = state.nodes.find((n) => n.id === action.payload.id);
      if (node) {
        node.position = action.payload.position;
      }
    },

    /**
     * Переключение панели свойств
     */
    togglePropertiesPanel: (state) => {
      state.isPropertiesPanelOpen = !state.isPropertiesPanelOpen;
    },

    /**
     * Обновление viewport (масштаб и положение канваса)
     */
    updateViewport: (
      state,
      action: PayloadAction<{ x: number; y: number; zoom: number }>,
    ) => {
      state.viewport = action.payload;
    },

    /**
     * Сброс состояния редактора
     */
    resetEditor: (state) => {
      Object.assign(state, initialStoryEditorState);
    },

    /**
     * Создание временного узла
     */
    addTemporaryNode: (
      state,
      action: PayloadAction<{
        position: { x: number; y: number };
        title?: string;
      }>,
    ) => {
      if (!state.currentStory) return;

      const temporaryNode = createTemporaryNode(
        action.payload.position,
        state.currentStory.id,
        action.payload.title,
      );

      state.nodes.push(temporaryNode);
      state.selectedNodeId = temporaryNode.id;
      state.selectedEdgeId = null;
    },

    /**
     * Создание временной связи между узлами
     */
    addTemporaryEdge: (
      state,
      action: PayloadAction<{
        sourceNodeId: number;
        targetNodeId: number;
        choiceText: string;
      }>,
    ) => {
      const temporaryEdge = createTemporaryEdge(
        action.payload.sourceNodeId,
        action.payload.targetNodeId,
        action.payload.choiceText,
      );

      state.edges.push(temporaryEdge);
      state.selectedEdgeId = temporaryEdge.id;
      state.selectedNodeId = null;
    },
  },
  extraReducers: (builder) => {
    // ==================== ОБРАБОТКА АСИНХРОННЫХ ДЕЙСТВИЙ ====================

    // ---------- getFullStoryThunk ----------
    builder
      .addCase(getFullStoryThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFullStoryThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentStory = action.payload;

        // Конвертируем узлы из БД в FlowNode
        const rawNodes = action.payload?.nodes ?? [];
        state.nodes = rawNodes.map(convertToFlowNode);

        // Конвертируем выборы из БД в FlowEdge
        // state.edges = action.payload.choices.map(convertToFlowEdge);
        console.log(action.payload);

        // Сбрасываем выбранные элементы
        state.selectedNodeId = null;
        state.selectedEdgeId = null;
      })
      .addCase(getFullStoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // ---------- getStoryChoicesThunk ----------
    builder.addCase(getStoryChoicesThunk.fulfilled, (state, action) => {
      // Обновляем только связи, оставляя узлы без изменений
      const rawChoices = action.payload ?? [];
      state.edges = rawChoices.map(convertToFlowEdge);
    });

    // ---------- createNodeThunk ----------
    builder
      .addCase(createNodeThunk.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(createNodeThunk.fulfilled, (state, action) => {
        state.isSaving = false;

        // Находим временный узел и заменяем его на сохраненный
        const savedNode = action.payload;
        const flowNode = convertToFlowNode(savedNode);

        // Ищем временный узел с negative ID
        const tempNodeIndex = state.nodes.findIndex((n) =>
          isTemporaryNode(n.id),
        );

        if (tempNodeIndex !== -1) {
          // Заменяем временный узел на сохраненный
          state.nodes[tempNodeIndex] = flowNode;
        } else {
          // Или добавляем новый
          state.nodes.push(flowNode);
        }

        // Выбираем созданный узел
        state.selectedNodeId = savedNode.id;
      })
      .addCase(createNodeThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // ---------- updateNodeThunk ----------
    builder
      .addCase(updateNodeThunk.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(updateNodeThunk.fulfilled, (state, action) => {
        state.isSaving = false;

        // Обновляем узел в состоянии
        const updatedNode = action.payload;
        const nodeIndex = state.nodes.findIndex((n) => n.id === updatedNode.id);

        if (nodeIndex !== -1) {
          state.nodes[nodeIndex] = convertToFlowNode(updatedNode);
        }
      })
      .addCase(updateNodeThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // ---------- deleteNodeThunk ----------
    builder.addCase(deleteNodeThunk.fulfilled, (state, action) => {
      const deletedNodeId = action.payload;

      // Удаляем узел
      state.nodes = state.nodes.filter((node) => node.id !== deletedNodeId);

      // Удаляем связанные связи
      state.edges = state.edges.filter(
        (edge) =>
          edge.source !== deletedNodeId.toString() &&
          edge.target !== deletedNodeId.toString(),
      );

      // Сбрасываем выбор если удален выбранный узел
      if (state.selectedNodeId === deletedNodeId) {
        state.selectedNodeId = null;
      }
    });

    // ---------- createChoiceThunk ----------
    builder
      .addCase(createChoiceThunk.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(createChoiceThunk.fulfilled, (state, action) => {
        state.isSaving = false;

        // Находим временную связь и заменяем ее на сохраненную
        const savedChoice = action.payload;
        const tempEdgeIndex = state.edges.findIndex((e) =>
          isTemporaryEdge(e.id),
        );

        if (tempEdgeIndex !== -1) {
          // Заменяем временную связь на сохраненную
          state.edges[tempEdgeIndex] = convertToFlowEdge(savedChoice);
        } else {
          // Или добавляем новую
          state.edges.push(convertToFlowEdge(savedChoice));
        }
      })
      .addCase(createChoiceThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    // ---------- updateChoiceThunk ----------
    builder.addCase(updateChoiceThunk.fulfilled, (state, action) => {
      const updatedChoice = action.payload;
      const edgeIndex = state.edges.findIndex(
        (e) => e.data.choiceId === updatedChoice.id,
      );

      if (edgeIndex !== -1) {
        state.edges[edgeIndex] = convertToFlowEdge(updatedChoice);
      }
    });

    // ---------- deleteChoiceThunk ----------
    builder.addCase(deleteChoiceThunk.fulfilled, (state, action) => {
      const deletedChoiceId = action.payload;

      // Удаляем связь
      state.edges = state.edges.filter(
        (edge) => edge.data.choiceId !== deletedChoiceId,
      );

      // Сбрасываем выбор если удалена выбранная связь
      if (state.selectedEdgeId === `edge-${deletedChoiceId}`) {
        state.selectedEdgeId = null;
      }
    });
  },
});

// ==================== ЭКСПОРТ ====================

// Экспортируем actions
export const {
  setCurrentStory,
  addNode,
  updateNode,
  deleteNode,
  addEdge,
  updateEdge,
  deleteEdge,
  selectNode,
  selectEdge,
  updateNodePosition,
  togglePropertiesPanel,
  updateViewport,
  resetEditor,
  addTemporaryNode,
  addTemporaryEdge,
} = storyEditorSlice.actions;

// Экспортируем reducer
export const storyEditorReducer = storyEditorSlice.reducer;

// Типы для экспорта
export type StoryEditorActions = typeof storyEditorSlice.actions;
