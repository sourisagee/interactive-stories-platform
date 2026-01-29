import {
  useStoryEditorActions,
  useSelectedNode,
  useSelectedEdge,
  useCurrentStory,
  useIsPropertiesPanelOpen,
  useNodes,
  useEdges,
} from "../../../../shared/hooks/storyEditorHooks";
import { isTemporaryEdge } from "../../../../entities/story/model/converters";
import "./EditorPanels.css";

/**
 * Панель инструментов редактора историй
 */
export default function Toolbar() {
  const currentStory = useCurrentStory();
  const nodes = useNodes();
  const edges = useEdges();
  const selectedNode = useSelectedNode();
  const selectedEdge = useSelectedEdge();
  const isPropertiesPanelOpen = useIsPropertiesPanelOpen();
  const {
    addTemporaryNode,
    deleteNode,
    deleteNodeThunk,
    deleteChoiceThunk,
    deleteEdge,
    getFullStory,
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

    // Простое авто-размещение: новые узлы идут «цепочкой» по оси X
    const index = nodes.length;
    const baseX = 200;
    const baseY = 150;
    const offsetX = 260;

    const position_x = baseX + index * offsetX;
    const position_y = baseY;

    // Создаём временный узел только на клиенте; реальные данные и координаты
    // сохраняются на сервере при нажатии «Сохранить» в панели свойств
    addTemporaryNode({ x: position_x, y: position_y }, "Новый узел");
  };

  // Обработчик удаления выбранного элемента
  const handleDelete = async () => {
    if (selectedNode) {
      if (!confirm("Вы уверены, что хотите удалить этот узел?")) return;
      const id = selectedNode.id;
      if (typeof id === "number" && id < 0) {
        deleteNode(id);
        selectNode(null);
        return;
      }
      const numId = Number(id);
      if (Number.isNaN(numId)) {
        selectNode(null);
        return;
      }
      const nodeIdStr = String(numId);
      const connectedEdges = edges.filter(
        (e) => e.source === nodeIdStr || e.target === nodeIdStr
      );
      // Сразу убираем узел и его связи из состояния — UI обновляется мгновенно
      deleteNode(numId);
      selectNode(null);
      // В фоне удаляем на сервере: сначала связи, затем узел
      try {
        for (const edge of connectedEdges) {
          if (edge.data.choiceId) {
            try {
              await deleteChoiceThunk(edge.data.choiceId);
            } catch {
              // игнорируем ошибку отдельной связи
            }
          }
        }
        await deleteNodeThunk(numId);
      } catch {
        if (currentStory?.id) getFullStory(currentStory.id);
      }
    } else if (selectedEdge) {
      if (confirm("Вы уверены, что хотите удалить эту связь?")) {
        if (isTemporaryEdge(selectedEdge.id)) {
          deleteEdge(selectedEdge.id);
          selectEdge(null);
        } else if (selectedEdge.data.choiceId) {
          deleteChoiceThunk(selectedEdge.data.choiceId);
          selectEdge(null);
        }
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
    <div className="editor-toolbar">
      <button
        type="button"
        onClick={handleAddNode}
        disabled={!currentStory}
        className={`editor-btn ${currentStory ? "editor-btn-primary" : "editor-btn-muted"}`}
        title="Добавить новый узел"
      >
        + Узел
      </button>

      <button
        type="button"
        onClick={handleDelete}
        className={`editor-btn ${selectedNode || selectedEdge ? "editor-btn-danger" : "editor-btn-muted"}`}
        title={selectedNode ? "Удалить узел" : selectedEdge ? "Удалить связь" : "Выберите узел или связь и нажмите для удаления"}
      >
        Удалить
      </button>

      <div className="editor-toolbar-divider" />

      <button
        type="button"
        onClick={handleTogglePropertiesPanel}
        className={`editor-btn ${isPropertiesPanelOpen ? "editor-btn-primary" : "editor-btn-secondary"}`}
        title={
          isPropertiesPanelOpen
            ? "Скрыть панель свойств"
            : "Показать панель свойств"
        }
      >
        {isPropertiesPanelOpen ? "◀ Свойства" : "Свойства ▶"}
      </button>

      {currentStory && (
        <div className="editor-toolbar-title">
          {currentStory.title}
        </div>
      )}
    </div>
  );
}
