import "./StarRating.css";

interface StarRatingProps {
  averageRating: number;
  totalRatings: number;
}

export default function StarRating({
  averageRating,
  totalRatings,
}: StarRatingProps) {
  const displayRating = averageRating || 0;

  return (
    <div className="star-rating">
      <div className="star-rating-stars">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          return (
            <span
              key={star}
              className={`star-rating-star ${isFilled ? "filled" : "empty"}`}
              aria-label={`${star} из 5`}
            >
              <span className="star-icon">⭐</span>
            </span>
          );
        })}
      </div>
      <div className="star-rating-info">
        <span className="star-rating-average">
          {averageRating > 0 ? averageRating.toFixed(1) : "—"}
        </span>
      </div>
    </div>
  );
}
