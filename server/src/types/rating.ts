export interface CreateRatingDto {
  rating: number; // 1-5
  storyId: number;
}

export interface RatingResponse {
  id: number;
  rating: number;
  userId: number;
  storyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoryRatingInfo {
  averageRating: number;
  totalRatings: number;
  userRating: number | null; // Оценка текущего пользователя, если есть
}
