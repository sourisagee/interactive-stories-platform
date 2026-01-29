import { useState, useEffect, useRef } from "react";
import {
  useSelectedNode,
  useSelectedEdge,
  useStoryEditorActions,
  useIsSaving,
} from "../../../../shared/hooks/storyEditorHooks";
import type { UpdateNodeFormData } from "../../../../entities/story/model";

/**
 * Панель свойств для редактирования выбранного узла или связи
 */
export default function PropertiesPanel() {
  const selectedNode = useSelectedNode();
  const selectedEdge = useSelectedEdge();
  const {
    // updateNodeThunk,
    updateChoiceThunk,
    deleteNodeThunk,
    deleteChoiceThunk,
  } = useStoryEditorActions();
  const isSaving = useIsSaving();

  // Отслеживаем предыдущие ID для предотвращения лишних обновлений
  const prevNodeIdRef = useRef<number | null>(null);
  const prevEdgeIdRef = useRef<string | null>(null);

  // Состояние формы для узла
  const [nodeForm, setNodeForm] = useState<UpdateNodeFormData>({
    title: "",
    content: "",
    picture: "",
    isStart: false,
    isEnd: false,
  });

  // Состояние формы для связи
  const [edgeForm, setEdgeForm] = useState({
    choiceText: "",
  });

  const actions = useStoryEditorActions();

  // Обновляем форму узла только при изменении ID выбранного узла
  useEffect(() => {
    if (selectedNode && selectedNode.id !== prevNodeIdRef.current) {
      prevNodeIdRef.current = selectedNode.id;
      // Синхронизация формы с выбранным узлом - правильный паттерн для редактирования
      setNodeForm({
        title: selectedNode.title || "",
        content: selectedNode.content || "",
        picture: selectedNode.picture || "",
        isStart: selectedNode.isStart || false,
        isEnd: selectedNode.isEnd || false,
      });
    } else if (!selectedNode) {
      prevNodeIdRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode?.id]);

  // Обновляем форму связи только при изменении ID выбранной связи
  useEffect(() => {
    if (selectedEdge && selectedEdge.id !== prevEdgeIdRef.current) {
      prevEdgeIdRef.current = selectedEdge.id;
      // Синхронизация формы с выбранной связью - правильный паттерн для редактирования
      setEdgeForm({
        choiceText: selectedEdge.data.choiceText || "",
      });
    } else if (!selectedEdge) {
      prevEdgeIdRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEdge?.id]);

  // Обработчик сохранения узла
  const handleSaveNode = () => {
    if (!selectedNode) return;

    const isTemporaryNode =
      typeof selectedNode.id === "number" && selectedNode.id < 0;

    // Для создания узла нужны обязательные поля
    const title = nodeForm.title ?? selectedNode.title ?? "";
    const content = nodeForm.content ?? selectedNode.content ?? "";
    const picture = nodeForm.picture ?? selectedNode.picture ?? "";
    const isStart = nodeForm.isStart ?? selectedNode.isStart ?? false;
    const isEnd = nodeForm.isEnd ?? selectedNode.isEnd ?? false;

    if (isTemporaryNode) {
      // Временный узел - создаем новый через createNodeThunk
      // ВСЕ поля обязательны для создания
      actions.createNodeThunk({
        storyId: selectedNode.storyId,
        title: title, // гарантированно string
        content: content, // гарантированно string
        picture: picture, // string (может быть пустой)
        isStart: isStart, // boolean
        isEnd: isEnd, // boolean
        position_x: selectedNode.position.x,
        position_y: selectedNode.position.y,
      });
    } else {
      // Существующий узел - обновляем через updateNodeThunk
      // Только измененные поля (опциональные)
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

      // Сохраняем только если есть изменения
      if (Object.keys(updates).length > 0) {
        actions.updateNodeThunk(selectedNode.id, updates);
      }
    }
  };

  // Обработчик сохранения связи
  const handleSaveEdge = () => {
    if (!selectedEdge || !selectedEdge.data.choiceId) return;

    if (edgeForm.choiceText !== selectedEdge.data.choiceText) {
      updateChoiceThunk(selectedEdge.data.choiceId, edgeForm.choiceText);
    }
  };

  // Обработчик удаления узла
  const handleDeleteNode = () => {
    if (!selectedNode) return;
    if (confirm("Вы уверены, что хотите удалить этот узел?")) {
      deleteNodeThunk(selectedNode.id);
    }
  };

  // Обработчик удаления связи
  const handleDeleteEdge = () => {
    if (!selectedEdge || !selectedEdge.data.choiceId) return;
    if (confirm("Вы уверены, что хотите удалить эту связь?")) {
      deleteChoiceThunk(selectedEdge.data.choiceId);
    }
  };

  // Если ничего не выбрано
  if (!selectedNode && !selectedEdge) {
    return (
      <div
        style={{
          padding: "20px",
          color: "#666",
          textAlign: "center",
        }}
      >
        Выберите узел или связь для редактирования
      </div>
    );
  }

  // Форма для редактирования узла
  if (selectedNode) {
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
        <h3
          style={{
            margin: "0 0 16px 0",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Редактирование узла
        </h3>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Название узла
          </label>
          <input
            type="text"
            value={nodeForm.title}
            onChange={(e) =>
              setNodeForm({ ...nodeForm, title: e.target.value })
            }
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
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Содержимое узла
          </label>
          <textarea
            value={nodeForm.content}
            onChange={(e) =>
              setNodeForm({ ...nodeForm, content: e.target.value })
            }
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
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            URL изображения
          </label>
          <input
            type="text"
            value={nodeForm.picture}
            onChange={(e) =>
              setNodeForm({ ...nodeForm, picture: e.target.value })
            }
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

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
            }}
          >
            <input
              type="checkbox"
              checked={nodeForm.isStart}
              onChange={(e) =>
                setNodeForm({ ...nodeForm, isStart: e.target.checked })
              }
            />
            Стартовый узел
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
            }}
          >
            <input
              type="checkbox"
              checked={nodeForm.isEnd}
              onChange={(e) =>
                setNodeForm({ ...nodeForm, isEnd: e.target.checked })
              }
            />
            Конечный узел
          </label>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "8px",
          }}
        >
          <button
            onClick={handleSaveNode}
            disabled={isSaving}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </button>

          <button
            onClick={handleDeleteNode}
            disabled={isSaving}
            style={{
              padding: "10px 16px",
              backgroundColor: "#d32f2f",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            Удалить
          </button>
        </div>
      </div>
    );
  }

  // Форма для редактирования связи
  if (selectedEdge) {
    return (
      <div
        key={`edge-${selectedEdge.id}`}
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <h3
          style={{
            margin: "0 0 16px 0",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Редактирование связи
        </h3>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Текст выбора
          </label>
          <input
            type="text"
            value={edgeForm.choiceText}
            onChange={(e) =>
              setEdgeForm({ ...edgeForm, choiceText: e.target.value })
            }
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
            placeholder="Введите текст выбора"
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "8px",
          }}
        >
          <button
            onClick={handleSaveEdge}
            disabled={isSaving || !selectedEdge.data.choiceId}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </button>

          <button
            onClick={handleDeleteEdge}
            disabled={isSaving || !selectedEdge.data.choiceId}
            style={{
              padding: "10px 16px",
              backgroundColor: "#d32f2f",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            Удалить
          </button>
        </div>
      </div>
    );
  }

  return null;
}
