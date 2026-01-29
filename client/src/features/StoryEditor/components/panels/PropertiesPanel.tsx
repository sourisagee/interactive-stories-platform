import { useState, useEffect, useRef } from "react";
import {
  useSelectedNode,
  useSelectedEdge,
  useCurrentStory,
  useEdges,
  useStoryEditorActions,
  useIsSaving,
} from "../../../../shared/hooks/storyEditorHooks";
import type { Story } from "../../../../entities/story/model";
import { isTemporaryEdge } from "../../../../entities/story/model/converters";
import NodeEditForm from "./NodeEditForm";
import { getCoverImageSrc } from "../../../../shared/lib/getServerBaseUrl";
import "./EditorPanels.css";

const panelBlock = {
  padding: "20px",
  display: "flex" as const,
  flexDirection: "column" as const,
  gap: "16px",
};
const panelLabel = {
  display: "block" as const,
  marginBottom: "8px",
  fontSize: "14px",
  fontWeight: 500 as const,
};
const panelInput = {
  width: "100%",
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "14px",
};
/** Режим редактирования истории (когда ничего не выбрано) */
function StoryFormSection({
  currentStory,
  onSave,
  isSaving,
}: {
  currentStory: Story | null;
  onSave: (storyId: number, updates: Partial<Story>) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState({
    title: "",
    genre: "",
    description: "",
    cover: "",
    authorName: "",
    isPublished: false,
  });

  useEffect(() => {
    if (currentStory) {
      setForm({
        title: currentStory.title ?? "",
        genre: currentStory.genre ?? "",
        description: currentStory.description ?? "",
        cover: currentStory.cover ?? "",
        authorName: currentStory.authorName ?? "",
        isPublished: currentStory.isPublished ?? false,
      });
    }
  }, [currentStory?.id]);

  if (!currentStory) {
    return (
      <div style={{ ...panelBlock, color: "#666", textAlign: "center" }}>
        Загрузите историю для редактирования
      </div>
    );
  }

  const handleSave = () => {
    const updates: Partial<Story> = {};
    if (form.title !== currentStory.title) updates.title = form.title;
    if (form.genre !== currentStory.genre) updates.genre = form.genre;
    if (form.description !== currentStory.description) updates.description = form.description;
    if (form.cover !== currentStory.cover) updates.cover = form.cover;
    if (form.authorName !== currentStory.authorName) updates.authorName = form.authorName;
    if (form.isPublished !== currentStory.isPublished) updates.isPublished = form.isPublished;
    if (Object.keys(updates).length > 0) {
      onSave(currentStory.id, updates);
    }
  };

  return (
    <div key={`story-${currentStory.id}`} style={panelBlock}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "bold" }}>
        Редактирование истории
      </h3>
      <div>
        <label style={panelLabel}>Название</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          style={panelInput}
          placeholder="Название истории"
        />
      </div>
      <div>
        <label style={panelLabel}>Автор</label>
        <input
          type="text"
          value={form.authorName}
          onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
          style={panelInput}
          placeholder="Имя автора"
        />
      </div>
      <div>
        <label style={panelLabel}>Жанр</label>
        <input
          type="text"
          value={form.genre}
          onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
          style={panelInput}
          placeholder="Жанр"
        />
      </div>
      <div>
        <label style={panelLabel}>Описание</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          style={{ ...panelInput, minHeight: "80px", resize: "vertical" }}
          placeholder="Описание"
        />
      </div>
      <div>
        <label style={panelLabel}>Обложка (URL)</label>
        <input
          type="text"
          value={form.cover}
          onChange={(e) => setForm((f) => ({ ...f, cover: e.target.value }))}
          style={panelInput}
          placeholder="URL обложки"
        />
        {form.cover.trim() && (
          <div style={{ marginTop: "8px", maxWidth: "200px", borderRadius: "6px", overflow: "hidden", border: "1px solid rgba(139, 107, 184, 0.3)" }}>
            <img src={getCoverImageSrc(form.cover)} alt="Превью обложки" style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        )}
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
        <input
          type="checkbox"
          checked={form.isPublished}
          onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
        />
        Опубликовано
      </label>
      <div className="editor-panel-actions">
        <button type="button" onClick={handleSave} disabled={isSaving} className="editor-panel-btn-save">
          {isSaving ? "Сохранение..." : "Сохранить"}
        </button>
      </div>
    </div>
  );
}

/**
 * Панель свойств для редактирования выбранного узла или связи
 */
export default function PropertiesPanel() {
  const selectedNode = useSelectedNode();
  const selectedEdge = useSelectedEdge();
  const currentStory = useCurrentStory();
  const edges = useEdges();
  const {
    updateChoiceThunk,
    deleteChoiceThunk,
    createChoiceThunk,
    deleteEdge,
    selectEdge,
    updateStory,
  } = useStoryEditorActions();
  const isSaving = useIsSaving();

  const prevEdgeIdRef = useRef<string | null>(null);

  // Состояние формы для связи
  const [edgeForm, setEdgeForm] = useState({
    choiceText: "",
  });

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

  // Обработчик сохранения связи (временная — создаём на сервере, иначе — обновляем)
  const handleSaveEdge = () => {
    if (!selectedEdge) return;

    if (isTemporaryEdge(selectedEdge.id)) {
      const fromId = Number(selectedEdge.source);
      const toId = Number(selectedEdge.target);
      if (fromId <= 0 || toId <= 0) {
        alert("Сначала сохраните оба узла, затем снова соедините их.");
        return;
      }
      createChoiceThunk({
        choiceText: edgeForm.choiceText,
        fromNodeId: fromId,
        toNodeId: toId,
      });
    } else if (selectedEdge.data.choiceId) {
      if (edgeForm.choiceText !== selectedEdge.data.choiceText) {
        updateChoiceThunk(selectedEdge.data.choiceId, edgeForm.choiceText);
      }
    }

    // Очищаем поле текста выбора и снимаем выделение,
    // чтобы плейсхолдер снова отображался
    setEdgeForm({ choiceText: "" });
    selectEdge(null);
  };

  // Обработчик удаления связи (временная — только из стейта, иначе — API)
  const handleDeleteEdge = () => {
    if (!selectedEdge) return;
    if (!confirm("Вы уверены, что хотите удалить эту связь?")) return;

    if (isTemporaryEdge(selectedEdge.id)) {
      deleteEdge(selectedEdge.id);
      selectEdge(null);
    } else if (selectedEdge.data.choiceId) {
      deleteChoiceThunk(selectedEdge.data.choiceId);
      selectEdge(null);
    }
  };

  // Режим редактирования истории (ничего не выбрано)
  if (!selectedNode && !selectedEdge) {
    return (
      <StoryFormSection
        currentStory={currentStory}
        onSave={updateStory}
        isSaving={isSaving}
      />
    );
  }

  // Форма для редактирования узла
  if (selectedNode) {
    return <NodeEditForm />;
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

        <div className="editor-panel-actions">
          <button
            type="button"
            onClick={handleSaveEdge}
            disabled={isSaving}
            className="editor-panel-btn-save"
          >
            {isSaving ? "Сохранение..." : isTemporaryEdge(selectedEdge.id) ? "Создать выбор" : "Сохранить"}
          </button>

          <button
            type="button"
            onClick={handleDeleteEdge}
            disabled={isSaving}
            className="editor-panel-btn-delete"
          >
            Удалить
          </button>
        </div>
      </div>
    );
  }

  return null;
}
