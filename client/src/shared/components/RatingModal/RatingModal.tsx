import { useState } from "react";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { createOrUpdateRatingThunk } from "../../../entities/rating/api/RatingApi";
import type { StoryRatingInfo } from "../../../entities/rating/api/RatingApi";
import "./RatingModal.css";

interface RatingModalProps {
  storyId: number;
  storyTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onRatingSubmitted: (ratingInfo: StoryRatingInfo) => void;
}

export default function RatingModal({
  storyId,
  storyTitle,
  isOpen,
  onClose,
  onRatingSubmitted,
}: RatingModalProps) {
  const dispatch = useAppDispatch();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleStarHover = (star: number | null) => {
    setHoveredStar(star);
  };

  const handleSubmit = async () => {
    if (!selectedRating || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await dispatch(
        createOrUpdateRatingThunk({ storyId, rating: selectedRating })
      ).unwrap();
      onRatingSubmitted(result);
      onClose();
      setSelectedRating(null);
    } catch (error) {
      console.error("Ошибка при оценке:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedRating(null);
    setHoveredStar(null);
    onClose();
  };

  const displayRating = hoveredStar !== null ? hoveredStar : (selectedRating || 0);

  return (
    <div className="rating-modal-overlay" onClick={handleCancel}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rating-modal-header">
          <h3 className="rating-modal-title">Оценить историю</h3>
          <button
            type="button"
            className="rating-modal-close"
            onClick={handleCancel}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <div className="rating-modal-content">
          <p className="rating-modal-story-title">{storyTitle}</p>
          <div className="rating-modal-stars">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= displayRating;
              return (
                <button
                  key={star}
                  type="button"
                  className={`rating-modal-star ${isFilled ? "filled" : "empty"}`}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={() => handleStarHover(null)}
                  disabled={isSubmitting}
                  aria-label={`Оценить ${star} из 5`}
                >
                  <span className="rating-modal-star-icon">⭐</span>
                </button>
              );
            })}
          </div>
          {selectedRating && (
            <p className="rating-modal-selected">
              Вы выбрали: {selectedRating} {selectedRating === 1 ? "звезда" : selectedRating < 5 ? "звезды" : "звёзд"}
            </p>
          )}
        </div>
        <div className="rating-modal-actions">
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
            disabled={!selectedRating || isSubmitting}
          >
            {isSubmitting ? "Отправка..." : "Оценить"}
          </button>
        </div>
      </div>
    </div>
  );
}
