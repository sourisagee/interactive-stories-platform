import axiosInstance from "@/shared/lib/axiosInstance";

export interface PlayerStats {
  completedStories: number;
  inProgressStories: number;
  memberSince: string; // ISO date string
}

export interface AuthorStats {
  totalStories: number;
  draftStories: number;
  memberSince: string; // ISO date string
}

export interface UserStatsResponse {
  user: {
    id: number;
    username: string;
    email: string;
    role: "USER" | "AUTHOR";
  };
  playerStats?: PlayerStats;
  authorStats?: AuthorStats;
}

export const statsApi = {
  // Получить мою статистику
  getMyStats: async (): Promise<UserStatsResponse> => {
    const response = await axiosInstance.get("/stats/my");

    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    } else {
      throw new Error("No data in response");
    }
  },

  // Получить статистику пользователя по ID
  getUserStats: async (userId: number): Promise<UserStatsResponse> => {
    const response = await axiosInstance.get(`/stats/user/${userId}`);

    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    } else {
      throw new Error("No data in response");
    }
  },
};
