import { useState, useEffect, useRef } from "react";
import {
  useSelectedNode,
  useCurrentStory,
  useNodes,
  useEdges,
  useStoryEditorActions,
  useIsSaving,
} from "../../../../shared/hooks/storyEditorHooks";
import type { UpdateNodeFormData } from "../../../../entities/story/model";
import "./EditorPanels.css";

interface NodeEditFormProps {
  onClose?: () => void;
}

/**
 * Форма редактирования узла. Используется в панели свойств и в модальном окне (двойной клик по узлу).
 */
export default function NodeEditForm({ onClose }: NodeEditFormProps) {
  const selectedNode = useSelectedNode();
  const nodes = useNodes();
  const edges = useEdges();
  const currentStory = useCurrentStory();
  const {
    deleteNode,
    deleteNodeThunk,
    deleteChoiceThunk,
    createChoiceThunk,
    createNodeThunk,
    updateNodeThunk,
    getFullStory,
    selectNode,
  } = useStoryEditorActions();
  const actions = useStoryEditorActions();
  const isSaving = useIsSaving();

  const prevNodeIdRef = useRef<number | null>(null);
  const [nodeForm, setNodeForm] = useState<UpdateNodeFormData>({
    title: "",
    content: "",
    picture: "",
    isStart: false,
    isEnd: false,
  });

  const hasStartInStory = nodes.some((n) => n.isStart);

  useEffect(() => {
    if (selectedNode && selectedNode.id !== prevNodeIdRef.current) {
      prevNodeIdRef.current = selectedNode.id;
      setNodeForm({
        title: selectedNode.title || "",
        content: selectedNode.content || "",
        picture: selectedNode.picture || "",
        isStart: selectedNode.isStart || false,
        isEnd: selectedNode.isStart ? false : (selectedNode.isEnd || false),
      });
    } else if (!selectedNode) {
      prevNodeIdRef.current = null;
    }
  }, [selectedNode?.id]);

  const handleSaveNode = async () => {
    if (!selectedNode) return;

    const isTemporaryNode =
      typeof selectedNode.id === "number" && selectedNode.id < 0;
    const currentId = selectedNode.id;

    const title = nodeForm.title ?? selectedNode.title ?? "";
    const content = nodeForm.content ?? selectedNode.content ?? "";
    const picture = nodeForm.picture ?? selectedNode.picture ?? "";
    const isStart = nodeForm.isStart ?? selectedNode.isStart ?? false;
    const isEnd = nodeForm.isEnd ?? selectedNode.isEnd ?? false;

    if (isStart) {
      const othersStart = nodes.filter(
        (n) =>
          n.id !== currentId &&
          n.isStart &&
          typeof n.id === "number" &&
          n.id > 0
      );
      for (const n of othersStart) {
        await actions.updateNodeThunk(n.id as number, { isStart: false });
      }
    }
    if (isEnd) {
      const othersEnd = nodes.filter(
        (n) =>
          n.id !== currentId &&
          n.isEnd &&
          typeof n.id === "number" &&
          n.id > 0
      );
      for (const n of othersEnd) {
        await actions.updateNodeThunk(n.id as number, { isEnd: false });
      }
    }

    if (isTemporaryNode) {
      createNodeThunk({
        nodeData: {
          storyId: selectedNode.storyId,
          title,
          content,
          picture: picture || "",
          isStart,
          isEnd,
          position_x: selectedNode.position.x,
          position_y: selectedNode.position.y,
        },
        temporaryNodeId: selectedNode.id as number,
      });
    } else {
      const updates: UpdateNodeFormData = {};
      if (
        nodeForm.title !== undefined &&
        nodeForm.title !== selectedNode.title
      ) {
        updates.title = nodeForm.title;
      }
      if (
        nodeForm.content !== undefined &&
        nodeForm.content !== selectedNode.content
      ) {
        updates.content = nodeForm.content;
      }
      if (
        nodeForm.picture !== undefined &&
        nodeForm.picture !== selectedNode.picture
      ) {
        updates.picture = nodeForm.picture;
      }
      if (
        nodeForm.isStart !== undefined &&
        nodeForm.isStart !== selectedNode.isStart
      ) {
        updates.isStart = nodeForm.isStart;
      }
      if (
        nodeForm.isEnd !== undefined &&
        nodeForm.isEnd !== selectedNode.isEnd
      ) {
        updates.isEnd = nodeForm.isEnd;
      }
      if (Object.keys(updates).length > 0) {
        actions.updateNodeThunk(selectedNode.id, updates);
      }
    }

    setNodeForm({
      title: "",
      content: "",
      picture: "",
      isStart: false,
      isEnd: false,
    });
    selectNode(null);
    onClose?.();
  };

  const handleDeleteNode = async () => {
    if (!selectedNode) return;
    if (!confirm("Вы уверены, что хотите удалить этот узел?")) return;
    const id = selectedNode.id;
    if (typeof id === "number" && id < 0) {
      deleteNode(id);
      selectNode(null);
      onClose?.();
      return;
    }
    const numId = Number(id);
    if (Number.isNaN(numId)) {
      selectNode(null);
      onClose?.();
      return;
    }
    const nodeIdStr = String(numId);
    const connectedEdges = edges.filter(
      (e) => e.source === nodeIdStr || e.target === nodeIdStr
    );
    deleteNode(numId);
    selectNode(null);
    try {
      for (const edge of connectedEdges) {
        if (edge.data.choiceId) {
          try {
            await deleteChoiceThunk(edge.data.choiceId);
          } catch {
            //
          }
        }
      }
      await deleteNodeThunk(numId);
    } catch {
      if (currentStory?.id) getFullStory(currentStory.id);
    }
    onClose?.();
  };

  if (!selectedNode) return null;

  return (
    <div
      key={`node-${selectedNode.id}`}
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      {onClose && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <h3
            id="node-edit-modal-title"
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            Редактирование узла
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            style={{
              padding: "6px 12px",
              fontSize: "14px",
              cursor: "pointer",
              border: "1px solid #ccc",
              borderRadius: "4px",
              background: "#f5f5f5",
            }}
          >
            ✕ Закрыть
          </button>
        </div>
      )}
      {!onClose && (
        <h3
          style={{
            margin: "0 0 16px 0",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Редактирование узла
        </h3>
      )}

      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
          Название узла
        </label>
        <input
          type="text"
          value={nodeForm.title}
          onChange={(e) => setNodeForm({ ...nodeForm, title: e.target.value })}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
          placeholder="Введите название узла"
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
          Содержимое узла
        </label>
        <textarea
          value={nodeForm.content}
          onChange={(e) => setNodeForm({ ...nodeForm, content: e.target.value })}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "14px",
            minHeight: "100px",
            resize: "vertical",
          }}
          placeholder="Введите содержимое узла"
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
          URL изображения
        </label>
        <input
          type="text"
          value={nodeForm.picture}
          onChange={(e) => setNodeForm({ ...nodeForm, picture: e.target.value })}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "14px",
          }}
          placeholder="Введите URL изображения"
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
          <input
            type="checkbox"
            checked={nodeForm.isStart}
            onChange={(e) => {
              const checked = e.target.checked;
              setNodeForm({
                ...nodeForm,
                isStart: checked,
                ...(checked && { isEnd: false }),
              });
            }}
          />
          Стартовый узел
        </label>
        <label
          style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}
          title={
            !hasStartInStory ? "Сначала выберите стартовый узел в любом узле" : undefined
          }
        >
          <input
            type="checkbox"
            checked={nodeForm.isEnd}
            disabled={!hasStartInStory}
            onChange={(e) => {
              const checked = e.target.checked;
              setNodeForm({
                ...nodeForm,
                isEnd: checked,
                ...(checked && { isStart: false }),
              });
            }}
          />
          Конечный узел
          {!hasStartInStory && (
            <span className="editor-panel-end-hint"> (сначала выберите стартовый)</span>
          )}
        </label>
      </div>

      <div className="editor-panel-actions">
        <button
          type="button"
          onClick={handleSaveNode}
          disabled={isSaving}
          className="editor-panel-btn-save"
        >
          {isSaving ? "Сохранение..." : "Сохранить"}
        </button>
        <button
          type="button"
          onClick={handleDeleteNode}
          disabled={isSaving}
          className="editor-panel-btn-delete"
        >
          Удалить
        </button>
      </div>
    </div>
  );
}
