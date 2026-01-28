import { useMemo } from "react";
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

  const {
    selectNode,
    selectEdge,
    updateNodePosition,
    updateViewport,
    createChoiceThunk,
  } = useStoryEditorActions();

  // Преобразуем наши FlowNode в формат, ожидаемый React Flow
  const rfNodes = useMemo(
    () =>
      nodesState.map((node: FlowNode) => ({
        id: String(node.id),
        position: node.position,
        data: node,
        type: node.type || "normal",
      })),
    [nodesState],
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
    selectNode(data.id);
    selectEdge(null);
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
  };

  const handleConnect: OnConnect = (connection) => {
    if (!connection.source || !connection.target) return;

    const fromNodeId = Number(connection.source);
    const toNodeId = Number(connection.target);

    // Создаем выбор с дефолтным текстом, пользователь изменит его в панели свойств
    createChoiceThunk({
      choiceText: "Новый выбор",
      fromNodeId,
      toNodeId,
    });
  };

  const handleMoveEnd = (_: Viewport, nextViewport: Viewport) => {
    updateViewport(nextViewport);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: "600px",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #ddd",
        backgroundColor: "#fff",
      }}
    >
      <Toolbar />

      {isLoading && (
        <div
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            color: "#666",
            borderBottom: "1px solid #eee",
          }}
        >
          Загрузка истории...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            color: "#d32f2f",
            borderBottom: "1px solid #f1b0b7",
            backgroundColor: "#ffebee",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Левая часть: канвас React Flow */}
        <div
          style={{
            flex: 1,
            // minWidth: 0,
            width: '500px',
            height: "500px",
          }}
        >
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            nodeTypes={nodeTypes}
            onNodeClick={handleNodeClick}
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

        {/* Правая часть: панель свойств */}
        <div
          style={{
            width: "340px",
            borderLeft: "1px solid #eee",
            backgroundColor: "#fafafa",
          }}
        >
          <PropertiesPanel />
        </div>
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
