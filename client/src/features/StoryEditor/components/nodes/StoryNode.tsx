import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { FlowNode } from "../../../../entities/story/model";

/**
 * Кастомный узел для React Flow
 * Отображает узел истории с возможностью соединения через Handle'ы
 */
export default function StoryNode({ data, selected }: NodeProps) {
  // Приводим data к типу FlowNode, так как React Flow передает данные в поле data
  const nodeData = data as unknown as FlowNode;
  const nodeType = nodeData.type || "normal";
  const isStart = nodeType === "start";
  const isEnd = nodeType === "end";

  return (
    <div
      style={{
        minWidth: "200px",
        padding: "12px",
        borderRadius: "8px",
        border: selected ? "2px solid #1976d2" : "2px solid #ccc",
        backgroundColor: isStart || isEnd
          ? "rgba(248, 246, 252, 0.98)"
          : "#f5f5f5",
        boxShadow: selected
          ? "0 4px 8px rgba(0,0,0,0.2)"
          : "0 2px 4px rgba(0,0,0,0.1)",
        transition: "all 0.2s",
        cursor: "pointer",
      }}
    >
      {/* Handle для входящих соединений (слева) - только если не стартовый узел */}

      <Handle
        type="target"
        position={Position.Left}
        isConnectable={!isStart}
        style={{
          background: "#555",
          width: "10px",
          height: "10px",
          opacity: isStart ? 0 : 1, // optional: hide but keep DOM node
          pointerEvents: isStart ? "none" : "auto",
        }}
      />

      {/* Заголовок узла */}
      <div
        style={{
          fontWeight: "bold",
          marginBottom: "8px",
          fontSize: "14px",
          color: "#333",
          textAlign: "center",
        }}
      >
        {nodeData.title || "Без названия"}
      </div>

      {/* Бейдж типа узла: для Старт/Конец — цвета в стилистике проекта, для обычного узла — серый */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "10px",
            fontWeight: "600",
            backgroundColor: isStart || isEnd
              ? "rgba(139, 107, 184, 0.25)"
              : "#757575",
            color: isStart
              ? "var(--color-purple-mid, #4a2d6a)"
              : isEnd
                ? "var(--color-burgundy-mid, #5c2438)"
                : "#fff",
            textTransform: "uppercase",
          }}
        >
          {isStart ? "Старт" : isEnd ? "Конец" : "Узел"}
        </span>
      </div>

      {/* Превью содержимого (первые 50 символов) */}
      {nodeData.content && (
        <div
          style={{
            fontSize: "11px",
            color: "#666",
            marginTop: "8px",
            maxHeight: "40px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: "1.4",
          }}
          title={nodeData.content}
        >
          {nodeData.content.length > 50
            ? `${nodeData.content.substring(0, 50)}...`
            : nodeData.content}
        </div>
      )}

      {/* Handle для исходящих соединений (справа) - только если не конечный узел */}

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={!isEnd}
        style={{
          background: "#555",
          width: "10px",
          height: "10px",
          opacity: isEnd ? 0 : 1, // optional: hide but keep DOM node
          pointerEvents: isEnd ? "none" : "auto",
        }}
      />
    </div>
  );
}
