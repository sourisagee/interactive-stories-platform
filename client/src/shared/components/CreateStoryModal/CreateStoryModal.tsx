import { useState } from "react";
import { useAppDispatch } from "../../hooks/reduxHooks";
import type { CreateStoryFormData } from "../../../entities/story/model";
import { getCoverImageSrc } from "../../lib/getServerBaseUrl";
import "./CreateStoryModal.css";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: (story: { id: number }) => void;
  authorName: string;
}

const INITIAL_FORM_DATA: CreateStoryFormData = {
  title: "",
  genre: "",
  description: "",
  cover: "",
  authorName: "",
};

export default function CreateStoryModal({
  isOpen,
  onClose,
  onStoryCreated,
  authorName,
}: CreateStoryModalProps) {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<CreateStoryFormData>({
    ...INITIAL_FORM_DATA,
    authorName,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<CreateStoryFormData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateStoryFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Название обязательно";
    }
    if (!formData.genre.trim()) {
      newErrors.genre = "Жанр обязателен";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Описание обязательно";
    }
    if (!formData.authorName.trim()) {
      newErrors.authorName = "Укажите автора";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof CreateStoryFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (submitError) setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!validateForm() || isSubmitting) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const { createStoryThunk } = await import(
        "../../../entities/story/api/StoryApi"
      );

      const storyData = {
        ...formData,
        cover: formData.cover.trim() || "/default-cover.jpg",
      };

      const result = await dispatch(createStoryThunk(storyData)).unwrap();
      onStoryCreated(result);
      handleCancel();
    } catch (error: unknown) {
      const err = error as { payload?: string; message?: string };
      const message =
        err?.payload ?? err?.message ?? (typeof error === "string" ? error : "Не удалось создать историю");
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...INITIAL_FORM_DATA, authorName });
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="create-story-modal-overlay" onClick={handleCancel}>
      <div className="create-story-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-story-modal-header">
          <h3 className="create-story-modal-title">Создать новую историю</h3>
          <button
            type="button"
            className="create-story-modal-close"
            onClick={handleCancel}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="create-story-modal-content">
          <form className="create-story-form">
            <div className="form-group">
              <label htmlFor="story-title" className="form-label">
                Название истории *
              </label>
              <input
                id="story-title"
                type="text"
                className={`form-input ${
                  errors.title ? "form-input-error" : ""
                }`}
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Введите название истории"
                disabled={isSubmitting}
              />
              {errors.title && (
                <span className="form-error">{errors.title}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="story-author" className="form-label">
                Автор *
              </label>
              <input
                id="story-author"
                type="text"
                className={`form-input ${
                  errors.authorName ? "form-input-error" : ""
                }`}
                value={formData.authorName}
                onChange={(e) => handleInputChange("authorName", e.target.value)}
                placeholder="Введите имя автора"
                disabled={isSubmitting}
              />
              {errors.authorName && (
                <span className="form-error">{errors.authorName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="story-genre" className="form-label">
                Жанр *
              </label>
              <input
                id="story-genre"
                type="text"
                className={`form-input ${
                  errors.genre ? "form-input-error" : ""
                }`}
                value={formData.genre}
                onChange={(e) => handleInputChange("genre", e.target.value)}
                placeholder="Например: Фантастика, Детектив, Романтика"
                disabled={isSubmitting}
              />
              {errors.genre && (
                <span className="form-error">{errors.genre}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="story-description" className="form-label">
                Описание *
              </label>
              <textarea
                id="story-description"
                className={`form-textarea ${
                  errors.description ? "form-input-error" : ""
                }`}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Краткое описание вашей истории"
                rows={4}
                disabled={isSubmitting}
              />
              {errors.description && (
                <span className="form-error">{errors.description}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="story-cover" className="form-label">
                Обложка (URL)
              </label>
              <input
                id="story-cover"
                type="url"
                className="form-input"
                value={formData.cover}
                onChange={(e) => handleInputChange("cover", e.target.value)}
                placeholder="https://example.com/cover.jpg (если не указано, будет использована стандартная обложка)"
                disabled={isSubmitting}
              />
              {formData.cover.trim() && (
                <div className="create-story-modal-cover-preview">
                  <img src={getCoverImageSrc(formData.cover)} alt="Превью обложки" />
                </div>
              )}
            </div>
          </form>
        </div>

        {submitError && (
          <div
            className="form-error"
            style={{
              margin: "0 20px 12px",
              padding: "10px 12px",
              backgroundColor: "#ffebee",
              borderRadius: "4px",
              color: "#c62828",
              fontSize: "14px",
            }}
          >
            {submitError}
          </div>
        )}
        <div className="create-story-modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Отмена
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !formData.title.trim() ||
              !formData.genre.trim() ||
              !formData.description.trim() ||
              !formData.authorName.trim()
            }
          >
            {isSubmitting ? "Создание..." : "Создать историю"}
          </button>
        </div>
      </div>
    </div>
  );
}
