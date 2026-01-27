import {
  useStoryEditorActions,
  useSelectedNode,
  useSelectedEdge,
  useCurrentStory,
  useIsPropertiesPanelOpen,
} from "../../../../shared/hooks/storyEditorHooks";

/**
 * Панель инструментов редактора историй
 */
export default function Toolbar() {
  const currentStory = useCurrentStory();
  const selectedNode = useSelectedNode();
  const selectedEdge = useSelectedEdge();
  const isPropertiesPanelOpen = useIsPropertiesPanelOpen();
  const {
    addTemporaryNode,
    deleteNodeThunk,
    deleteChoiceThunk,
    togglePropertiesPanel,
    selectNode,
    selectEdge,
  } = useStoryEditorActions();

  // Обработчик добавления нового узла
  const handleAddNode = () => {
    if (!currentStory) {
      alert("Сначала выберите или создайте историю");
      return;
    }

    // Добавляем узел в центр экрана (примерные координаты)
    // В реальном редакторе координаты будут определяться позицией клика или центром viewport
    addTemporaryNode({ x: 400, y: 300 }, "Новый узел");
  };

  // Обработчик удаления выбранного элемента
  const handleDelete = () => {
    if (selectedNode) {
      if (confirm("Вы уверены, что хотите удалить этот узел?")) {
        deleteNodeThunk(selectedNode.id);
        selectNode(null);
      }
    } else if (selectedEdge && selectedEdge.data.choiceId) {
      if (confirm("Вы уверены, что хотите удалить эту связь?")) {
        deleteChoiceThunk(selectedEdge.data.choiceId);
        selectEdge(null);
      }
    } else {
      alert("Выберите узел или связь для удаления");
    }
  };

  // Обработчик переключения панели свойств
  const handleTogglePropertiesPanel = () => {
    togglePropertiesPanel();
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        padding: "12px",
        backgroundColor: "#f5f5f5",
        borderBottom: "1px solid #ddd",
        alignItems: "center",
      }}
    >
      {/* Кнопка добавления узла */}
      <button
        onClick={handleAddNode}
        disabled={!currentStory}
        style={{
          padding: "8px 16px",
          backgroundColor: currentStory ? "#1976d2" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: "500",
          cursor: currentStory ? "pointer" : "not-allowed",
          opacity: currentStory ? 1 : 0.6,
        }}
        title="Добавить новый узел"
      >
        + Узел
      </button>

      {/* Кнопка удаления выбранного элемента */}
      <button
        onClick={handleDelete}
        disabled={!selectedNode && !selectedEdge}
        style={{
          padding: "8px 16px",
          backgroundColor: selectedNode || selectedEdge ? "#d32f2f" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: "500",
          cursor: selectedNode || selectedEdge ? "pointer" : "not-allowed",
          opacity: selectedNode || selectedEdge ? 1 : 0.6,
        }}
        title="Удалить выбранный элемент"
      >
        Удалить
      </button>

      {/* Разделитель */}
      <div
        style={{
          width: "1px",
          height: "24px",
          backgroundColor: "#ddd",
          margin: "0 8px",
        }}
      />

      {/* Кнопка переключения панели свойств */}
      <button
        onClick={handleTogglePropertiesPanel}
        style={{
          padding: "8px 16px",
          backgroundColor: isPropertiesPanelOpen ? "#1976d2" : "#757575",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: "500",
          cursor: "pointer",
        }}
        title={
          isPropertiesPanelOpen
            ? "Скрыть панель свойств"
            : "Показать панель свойств"
        }
      >
        {isPropertiesPanelOpen ? "◀ Свойства" : "Свойства ▶"}
      </button>

      {/* Информация о текущей истории */}
      {currentStory && (
        <div
          style={{
            marginLeft: "auto",
            padding: "4px 12px",
            fontSize: "14px",
            color: "#666",
            fontWeight: "500",
          }}
        >
          {currentStory.title}
        </div>
      )}
    </div>
  );
}
