import { useAppDispatch, useAppSelector } from "../../shared/hooks/reduxHooks";
import type { RootState } from "../../app/store/store";
import {
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
} from "../../entities/story/slice/storyEditorSlice";
import {
  createStoryThunk,
  getFullStoryThunk,
  updateStoryThunk,
  getMyStoriesThunk,
  getStoryChoicesThunk,
  createNodeThunk,
  updateNodeThunk,
  deleteNodeThunk,
  createChoiceThunk,
  updateChoiceThunk,
  deleteChoiceThunk,
} from "../../entities/story/api/StoryApi";
import type {
  Story,
  FlowNode,
  FlowEdge,
  CreateStoryFormData,
  UpdateNodeFormData,
  CreateChoiceFormData,
} from "../../entities/story/model";

// ==================== СЕЛЕКТОРЫ ====================

/**
 * Селектор для всего состояния story editor
 */
export const useStoryEditorState = () =>
  useAppSelector((state: RootState) => state.storyEditor);

/**
 * Селектор для текущей истории
 */
export const useCurrentStory = () =>
  useAppSelector((state: RootState) => state.storyEditor.currentStory);

/**
 * Селектор для узлов (FlowNode[])
 */
export const useNodes = () =>
  useAppSelector((state: RootState) => state.storyEditor.nodes);

/**
 * Селектор для связей (FlowEdge[])
 */
export const useEdges = () =>
  useAppSelector((state: RootState) => state.storyEditor.edges);

/**
 * Селектор для выбранного узла
 */
export const useSelectedNode = () => {
  const { selectedNodeId, nodes } = useStoryEditorState();
  return selectedNodeId
    ? nodes.find((node) => node.id === selectedNodeId)
    : null;
};

/**
 * Селектор для выбранной связи
 */
export const useSelectedEdge = () => {
  const { selectedEdgeId, edges } = useStoryEditorState();
  return selectedEdgeId
    ? edges.find((edge) => edge.id === selectedEdgeId)
    : null;
};

/**
 * Селектор для состояния загрузки
 */
export const useIsLoading = () =>
  useAppSelector((state: RootState) => state.storyEditor.isLoading);

/**
 * Селектор для состояния сохранения
 */
export const useIsSaving = () =>
  useAppSelector((state: RootState) => state.storyEditor.isSaving);

/**
 * Селектор для ошибок
 */
export const useError = () =>
  useAppSelector((state: RootState) => state.storyEditor.error);

/**
 * Селектор для состояния панели свойств
 */
export const useIsPropertiesPanelOpen = () =>
  useAppSelector((state: RootState) => state.storyEditor.isPropertiesPanelOpen);

/**
 * Селектор для viewport (масштаб и положение)
 */
export const useViewport = () =>
  useAppSelector((state: RootState) => state.storyEditor.viewport);

// ==================== ДЕЙСТВИЯ ====================

/**
 * Хук для получения dispatch и всех actions
 */
export const useStoryEditorActions = () => {
  const dispatch = useAppDispatch();

  return {
    // Синхронные actions
    setCurrentStory: (story: Story | null) => dispatch(setCurrentStory(story)),
    addNode: (node: FlowNode) => dispatch(addNode(node)),
    updateNode: (id: number, updates: Partial<FlowNode>) =>
      dispatch(updateNode({ id, updates })),
    deleteNode: (id: number) => dispatch(deleteNode(id)),
    addEdge: (edge: FlowEdge) => dispatch(addEdge(edge)),
    updateEdge: (id: string, updates: Partial<FlowEdge>) =>
      dispatch(updateEdge({ id, updates })),
    deleteEdge: (id: string) => dispatch(deleteEdge(id)),
    selectNode: (id: number | null) => dispatch(selectNode(id)),
    selectEdge: (id: string | null) => dispatch(selectEdge(id)),
    updateNodePosition: (id: number, position: { x: number; y: number }) =>
      dispatch(updateNodePosition({ id, position })),
    togglePropertiesPanel: () => dispatch(togglePropertiesPanel()),
    updateViewport: (viewport: { x: number; y: number; zoom: number }) =>
      dispatch(updateViewport(viewport)),
    resetEditor: () => dispatch(resetEditor()),
    addTemporaryNode: (position: { x: number; y: number }, title?: string) =>
      dispatch(addTemporaryNode({ position, title })),
    addTemporaryEdge: (
      sourceNodeId: number,
      targetNodeId: number,
      choiceText: string,
    ) => dispatch(addTemporaryEdge({ sourceNodeId, targetNodeId, choiceText })),

    // Асинхронные thunks (story)
    createStory: (data: CreateStoryFormData) =>
      dispatch(createStoryThunk(data)),
    getFullStory: (storyId: number) => dispatch(getFullStoryThunk(storyId)),
    updateStory: (storyId: number, updates: Partial<Story>) =>
      dispatch(updateStoryThunk({ storyId, updates })),
    getUserStories: () => dispatch(getMyStoriesThunk()),
    getStoryChoices: (storyId: number) =>
      dispatch(getStoryChoicesThunk(storyId)),

    // Асинхронные thunks (nodes)
    createNodeThunk: (data: Parameters<typeof createNodeThunk>[0]) =>
      dispatch(createNodeThunk(data)),
    updateNodeThunk: (nodeId: number, updates: UpdateNodeFormData) =>
      dispatch(updateNodeThunk({ nodeId, updates })),
    deleteNodeThunk: (nodeId: number) => dispatch(deleteNodeThunk(nodeId)),

    // Асинхронные thunks (choices)
    createChoiceThunk: (data: CreateChoiceFormData) =>
      dispatch(createChoiceThunk(data)),
    updateChoiceThunk: (choiceId: number, choiceText: string) =>
      dispatch(updateChoiceThunk({ choiceId, choiceText })),
    deleteChoiceThunk: (choiceId: number) =>
      dispatch(deleteChoiceThunk(choiceId)),
  };
};

// ==================== КОМБИНИРОВАННЫЕ ХУКИ ====================

/**
 * Комплексный хук для редактора (состояние + actions)
 */
export const useStoryEditor = () => {
  const state = useStoryEditorState();
  const actions = useStoryEditorActions();

  return {
    ...state,
    ...actions,
    selectedNode: state.selectedNodeId
      ? state.nodes.find((node) => node.id === state.selectedNodeId)
      : null,
    selectedEdge: state.selectedEdgeId
      ? state.edges.find((edge) => edge.id === state.selectedEdgeId)
      : null,
  };
};

/**
 * Хук для работы с узлами
 */
export const useNodesManager = () => {
  const nodes = useNodes();
  const { addNode, updateNode, deleteNode, createNodeThunk, updateNodeThunk } =
    useStoryEditorActions();

  return {
    nodes,
    addNode,
    updateNode,
    deleteNode,
    createNodeThunk,
    updateNodeThunk,
  };
};

/**
 * Хук для работы со связями
 */
export const useEdgesManager = () => {
  const edges = useEdges();
  const {
    addEdge,
    updateEdge,
    deleteEdge,
    createChoiceThunk,
    updateChoiceThunk,
    deleteChoiceThunk,
  } = useStoryEditorActions();

  return {
    edges,
    addEdge,
    updateEdge,
    deleteEdge,
    createChoiceThunk,
    updateChoiceThunk,
    deleteChoiceThunk,
  };
};
/**
 * Хук для работы с выбранными элементами
 */
export const useSelection = () => {
  const selectedNode = useSelectedNode();
  const selectedEdge = useSelectedEdge();
  const { selectNode, selectEdge } = useStoryEditorActions();

  return {
    selectedNode,
    selectedEdge,
    selectNode,
    selectEdge,
    clearSelection: () => {
      selectNode(null);
      selectEdge(null);
    },
  };
};
