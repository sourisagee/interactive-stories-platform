import { useMemo, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  type OnConnect,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  type NodeDragHandler,
  type Viewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  useNodes,
  useEdges,
  useViewport,
  useIsLoading,
  useError,
  useIsPropertiesPanelOpen,
  useCurrentStory,
  useStoryEditorActions,
} from "../../shared/hooks/storyEditorHooks";
import type { FlowNode, FlowEdge } from "../../entities/story/model";
import StoryNode from "./components/nodes/StoryNode";
import { PropertiesPanel, Toolbar } from "./components/panels";

// Маппинг типов узлов React Flow на наш кастомный компонент
const nodeTypes = {
  start: StoryNode,
  normal: StoryNode,
  end: StoryNode,
  custom: StoryNode,
};

function StoryEditorInner() {
  const nodesState = useNodes();
  const edgesState = useEdges();
  const viewport = useViewport();
  const isLoading = useIsLoading();
  const error = useError();
  const isPropertiesPanelOpen = useIsPropertiesPanelOpen();
  const currentStory = useCurrentStory();
  const lastNodeClickRef = useRef<{ nodeId: number | string; time: number } | null>(null);

  const {
    selectNode,
    selectEdge,
    updateNodePosition,
    updateViewport,
    addTemporaryEdge,
    createChoiceThunk,
    togglePropertiesPanel,
  } = useStoryEditorActions();

  // Преобразуем наши FlowNode в формат, ожидаемый React Flow
  const rfNodes = useMemo(
    () => {
      // Подгружаем сохранённые позиции узлов из localStorage (по storyId)
      let storedPositions: Record<string, { x: number; y: number }> | null =
        null;

      if (currentStory && typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem(
            "storyEditorNodePositions",
          );
          if (raw) {
            const parsed = JSON.parse(raw) as Record<
              string,
              Record<string, { x: number; y: number }>
            >;
            storedPositions = parsed[String(currentStory.id)] ?? null;
          }
        } catch {
          storedPositions = null;
        }
      }

      return nodesState.map((node: FlowNode) => {
        const override =
          storedPositions && storedPositions[String(node.id)];

        return {
          id: String(node.id),
          position: override ?? node.position,
          data: node,
          type: node.type || "normal",
        };
      });
    },
    [nodesState, currentStory],
  );

  // Преобразуем наши FlowEdge в формат React Flow
  const rfEdges = useMemo(
    () =>
      edgesState.map((edge: FlowEdge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.data.choiceText,
        data: edge.data,
        type: "default" as const,
      })),
    [edgesState],
  );


  const handleNodeClick: NodeMouseHandler = (_, node) => {
    const data = node.data as unknown as FlowNode;
    const nodeId = data.id;
    const now = Date.now();
    const last = lastNodeClickRef.current;
    const isDoubleClick =
      last &&
      last.nodeId === nodeId &&
      now - last.time < 350;

    if (isDoubleClick) {
      lastNodeClickRef.current = null;
      selectNode(nodeId);
      selectEdge(null);
      if (!isPropertiesPanelOpen) {
        togglePropertiesPanel();
      }
    } else {
      lastNodeClickRef.current = { nodeId, time: now };
      selectNode(nodeId);
      selectEdge(null);
    }
  };

  const handleNodeDoubleClick: NodeMouseHandler = (_, node) => {
    const data = node.data as unknown as FlowNode;
    selectNode(data.id);
    selectEdge(null);
    if (!isPropertiesPanelOpen) {
      togglePropertiesPanel();
    }
  };

  const handleEdgeClick: EdgeMouseHandler = (_, edge) => {
    selectNode(null);
    selectEdge(edge.id);
  };

  const handlePaneClick = () => {
    selectNode(null);
    selectEdge(null);
  };

  const handleNodeDragStop: NodeDragHandler = (_, node) => {
    const data = node.data as FlowNode;
    updateNodePosition(data.id, node.position);

    // Локально сохраняем новые координаты узла,
    // чтобы после перезагрузки восстановить их из localStorage
    if (
      currentStory &&
      typeof window !== "undefined" &&
      typeof data.id === "number" &&
      data.id > 0
    ) {
      try {
        const key = "storyEditorNodePositions";
        const raw = window.localStorage.getItem(key);
        const allPositions: Record<
          string,
          Record<string, { x: number; y: number }>
        > = raw ? JSON.parse(raw) : {};

        const storyKey = String(currentStory.id);
        const storyPositions = allPositions[storyKey] || {};
        storyPositions[String(data.id)] = {
          x: node.position.x,
          y: node.position.y,
        };
        allPositions[storyKey] = storyPositions;

        window.localStorage.setItem(key, JSON.stringify(allPositions));
      } catch {
        // Если localStorage недоступен — просто игнорируем
      }
    }
  };

  const handleConnect: OnConnect = (connection) => {
    if (!connection.source || !connection.target) return;

    const sourceNodeId = Number(connection.source);
    const targetNodeId = Number(connection.target);

    // Если один из узлов ещё временный (id <= 0) — создаём только временную связь
    if (sourceNodeId <= 0 || targetNodeId <= 0) {
      addTemporaryEdge(sourceNodeId, targetNodeId, "Новый выбор");
      return;
    }

    // Оба узла сохранены на сервере — сразу создаём выбор (связь) в API
    createChoiceThunk({
      choiceText: "Новый выбор",
      fromNodeId: sourceNodeId,
      toNodeId: targetNodeId,
    });
  };

  const handleMoveEnd = (_: Viewport, nextViewport: Viewport) => {
    updateViewport(nextViewport);
  };

  return (
    <div
      className="story-editor-root"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: "600px",
        overflow: "hidden",
      }}
    >
      <Toolbar />

      {isLoading && (
        <div className="story-editor-loading" style={{ padding: "8px 16px", fontSize: "14px", borderBottom: "1px solid transparent" }}>
          Загрузка истории...
        </div>
      )}

      {error && (
        <div className="story-editor-error" style={{ padding: "8px 16px", fontSize: "14px", borderBottom: "1px solid transparent" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div
          className="story-editor-canvas-wrap"
          style={{
            flex: 1,
            minWidth: 0,
            width: isPropertiesPanelOpen ? undefined : "100%",
            height: "80vh",
          }}
        >
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            nodeTypes={nodeTypes}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            onEdgeClick={handleEdgeClick}
            onPaneClick={handlePaneClick}
            onNodeDragStop={handleNodeDragStop}
            onConnect={handleConnect}
            defaultViewport={viewport}
            onMoveEnd={handleMoveEnd}
            fitView
          >
            <Background />
            <MiniMap />
            <Controls />
          </ReactFlow>
        </div>

        {isPropertiesPanelOpen && (
          <div
            className="story-editor-panel"
            style={{ width: "340px", flexShrink: 0 }}
          >
            <PropertiesPanel />
          </div>
        )}
      </div>
    </div>
  );
}

export default function StoryEditor() {
  return (
    <ReactFlowProvider>
      <StoryEditorInner />
    </ReactFlowProvider>
  );
}
