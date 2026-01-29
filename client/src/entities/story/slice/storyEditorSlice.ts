import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  getFullStoryThunk,
  updateStoryThunk,
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
  type Choice,
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
    setCurrentStory: (state, action: PayloadAction<Story | null>) => {
      state.currentStory = action.payload;
    },

    addNode: (state, action: PayloadAction<FlowNode>) => {
      state.nodes.push(action.payload);
    },

    updateNode: (
      state,
      action: PayloadAction<{ id: number; updates: Partial<FlowNode> }>
    ) => {
      const node = state.nodes.find((n) => n.id === action.payload.id);
      if (node) {
        Object.assign(node, action.payload.updates);
      }
    },

    deleteNode: (state, action: PayloadAction<number>) => {
      state.nodes = state.nodes.filter((node) => node.id !== action.payload);
      state.edges = state.edges.filter(
        (edge) =>
          edge.source !== action.payload.toString() &&
          edge.target !== action.payload.toString()
      );
    },

    addEdge: (state, action: PayloadAction<FlowEdge>) => {
      state.edges.push(action.payload);
    },

    updateEdge: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<FlowEdge> }>
    ) => {
      const edge = state.edges.find((e) => e.id === action.payload.id);
      if (edge) {
        Object.assign(edge, action.payload.updates);
      }
    },

    deleteEdge: (state, action: PayloadAction<string>) => {
      state.edges = state.edges.filter((edge) => edge.id !== action.payload);
    },

    selectNode: (state, action: PayloadAction<number | null>) => {
      state.selectedNodeId = action.payload;
      state.selectedEdgeId = null;
    },

    selectEdge: (state, action: PayloadAction<string | null>) => {
      state.selectedEdgeId = action.payload;
      state.selectedNodeId = null;
    },

    updateNodePosition: (
      state,
      action: PayloadAction<{ id: number; position: { x: number; y: number } }>
    ) => {
      const node = state.nodes.find((n) => n.id === action.payload.id);
      if (node) {
        node.position = action.payload.position;
      }
    },

    togglePropertiesPanel: (state) => {
      state.isPropertiesPanelOpen = !state.isPropertiesPanelOpen;
    },

    updateViewport: (
      state,
      action: PayloadAction<{ x: number; y: number; zoom: number }>
    ) => {
      state.viewport = action.payload;
    },

    resetEditor: (state) => {
      Object.assign(state, initialStoryEditorState);
    },

    addTemporaryNode: (
      state,
      action: PayloadAction<{
        position: { x: number; y: number };
        title?: string;
      }>
    ) => {
      if (!state.currentStory) return;

      const temporaryNode = createTemporaryNode(
        action.payload.position,
        state.currentStory.id,
        action.payload.title
      );

      state.nodes.push(temporaryNode);
      state.selectedNodeId = temporaryNode.id;
      state.selectedEdgeId = null;
    },

    addTemporaryEdge: (
      state,
      action: PayloadAction<{
        sourceNodeId: number;
        targetNodeId: number;
        choiceText: string;
      }>
    ) => {
      const temporaryEdge = createTemporaryEdge(
        action.payload.sourceNodeId,
        action.payload.targetNodeId,
        action.payload.choiceText
      );

      state.edges.push(temporaryEdge);
      state.selectedEdgeId = temporaryEdge.id;
      state.selectedNodeId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFullStoryThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFullStoryThunk.fulfilled, (state, action) => {
        state.isLoading = false;

        const payload = action.payload as unknown as {
          story?: Story;
          nodes?: unknown[];
          choices?: unknown[];
        } & Story;

        // Поддерживаем оба варианта ответа:
        // 1) StoryWithNodes: { story, nodes, choices }
        // 2) StoryFullData:  Story & { nodes }
        const story = payload.story ?? (payload as Story);
        const rawNodes = ((payload as { nodes?: unknown[] }).nodes ?? []) as FlowNode[];
        const rawChoices = ((payload as { choices?: unknown[] }).choices ??
          []) as Choice[];

        state.currentStory = story;

        // Конвертируем узлы из БД в FlowNode
        state.nodes = rawNodes.map(convertToFlowNode);

        // Вариант 1: сервер вернул плоский список choices
        let choices: Choice[] = rawChoices;

        // Вариант 2: сервер вернул choices, вложенные в узлы (NodeWithChoices.fromChoices)
        if (!choices.length && rawNodes.length) {
          const fromNested = (rawNodes as unknown as Array<
            FlowNode & { fromChoices?: Choice[] }
          >).flatMap((node) => node.fromChoices ?? []);

          const uniqueById = new Map<number, Choice>();
          fromNested.forEach((ch) => {
            if (ch && typeof ch.id === "number" && !uniqueById.has(ch.id)) {
              uniqueById.set(ch.id, ch);
            }
          });

          choices = Array.from(uniqueById.values());
        }

        // Конвертируем выборы из БД в FlowEdge
        state.edges = choices.map(convertToFlowEdge);

        // Сбрасываем выбранные элементы
        state.selectedNodeId = null;
        state.selectedEdgeId = null;
      })
      .addCase(getFullStoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(getStoryChoicesThunk.fulfilled, (state, action) => {
      const rawChoices = action.payload ?? [];
      state.edges = rawChoices.map(convertToFlowEdge);
    });

    builder.addCase(updateStoryThunk.fulfilled, (state, action) => {
      if (state.currentStory?.id === action.payload.id) {
        state.currentStory = action.payload;
      }
    });

    builder
      .addCase(createNodeThunk.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(createNodeThunk.fulfilled, (state, action) => {
        state.isSaving = false;

        const savedNode = action.payload;
        const flowNode = convertToFlowNode(savedNode);
        const temporaryNodeId = action.meta.arg.temporaryNodeId;

        const tempNodeIndex =
          temporaryNodeId != null
            ? state.nodes.findIndex((n) => n.id === temporaryNodeId)
            : state.nodes.findIndex((n) => isTemporaryNode(n.id));

        if (tempNodeIndex !== -1) {
          state.nodes[tempNodeIndex] = flowNode;
        } else {
          state.nodes.push(flowNode);
        }

        state.selectedNodeId = savedNode.id;
      })
      .addCase(createNodeThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateNodeThunk.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(updateNodeThunk.fulfilled, (state, action) => {
        state.isSaving = false;

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

    builder.addCase(deleteNodeThunk.fulfilled, (state, action) => {
      const deletedNodeId = action.payload;

      state.nodes = state.nodes.filter((node) => node.id !== deletedNodeId);

      state.edges = state.edges.filter(
        (edge) =>
          edge.source !== deletedNodeId.toString() &&
          edge.target !== deletedNodeId.toString()
      );

      if (state.selectedNodeId === deletedNodeId) {
        state.selectedNodeId = null;
      }
    });

    builder
      .addCase(createChoiceThunk.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(createChoiceThunk.fulfilled, (state, action) => {
        state.isSaving = false;

        // Находим временную связь и заменяем ее на сохраненную
        const savedChoice = action.payload;
        const tempEdgeIndex = state.edges.findIndex((e) =>
          isTemporaryEdge(e.id)
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

    builder.addCase(updateChoiceThunk.fulfilled, (state, action) => {
      const updatedChoice = action.payload;
      const edgeIndex = state.edges.findIndex(
        (e) => e.data.choiceId === updatedChoice.id
      );

      if (edgeIndex !== -1) {
        state.edges[edgeIndex] = convertToFlowEdge(updatedChoice);
      }
    });

    builder.addCase(deleteChoiceThunk.fulfilled, (state, action) => {
      const deletedChoiceId = action.payload;

      state.edges = state.edges.filter(
        (edge) => edge.data.choiceId !== deletedChoiceId
      );

      if (state.selectedEdgeId === `edge-${deletedChoiceId}`) {
        state.selectedEdgeId = null;
      }
    });
  },
});

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

export const storyEditorReducer = storyEditorSlice.reducer;

export type StoryEditorActions = typeof storyEditorSlice.actions;
