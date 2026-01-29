import axiosInstance from "@/shared/lib/axiosInstance";

export interface PlayerStats {
  completedStories: number;
  inProgressStories: number;
  memberSince: string; 
}

export interface AuthorStats {
  totalStories: number;
  draftStories: number;
  memberSince: string; 
}

export interface GameInfo {
  id: number;
  title: string;
  cover: string;
  genre: string;
  authorName: string;
  isCompleted: boolean;
  updatedAt: string; 
}

export interface AuthorStory {
  id: number;
  title: string;
  cover: string;
  genre: string;
  description: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
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
  games?: {
    inProgress: GameInfo[];
    completed: GameInfo[];
  };
  authorStories?: {
    drafts: AuthorStory[];
    published: AuthorStory[];
  };
}

export const statsApi = {
  getMyStats: async (): Promise<UserStatsResponse> => {
    const response = await axiosInstance.get("/stats/my");
    let statsData;

    if (response.data?.data) {
      statsData = response.data.data;
    } else if (response.data) {
      statsData = response.data;
    } else {
      throw new Error("No data in response");
    }

    if (statsData.user.role === "USER") {
      try {
        const playthroughsResponse = await axiosInstance.get(
          "/playthroughs/user/all"
        );

        let playthroughs = null;

        if (playthroughsResponse.data?.data) {
          playthroughs = playthroughsResponse.data.data;
        } else if (playthroughsResponse.data) {
          playthroughs = playthroughsResponse.data;
        } else {
          playthroughs = [];
        }

        const inProgress: GameInfo[] = [];
        const completed: GameInfo[] = [];

        if (
          playthroughs &&
          Array.isArray(playthroughs) &&
          playthroughs.length > 0
        ) {
          for (const playthrough of playthroughs) {
            if (playthrough && playthrough.story) {
              const gameInfo: GameInfo = {
                id: playthrough.story.id,
                title: playthrough.story.title,
                cover: playthrough.story.cover || "/default-cover.jpg",
                genre: playthrough.story.genre || "Неизвестно",
                authorName: playthrough.story.authorName,
                isCompleted: playthrough.isCompleted,
                updatedAt: playthrough.updatedAt,
              };

              if (playthrough.isCompleted) {
                completed.push(gameInfo);
              } else {
                inProgress.push(gameInfo);
              }
            }
          }
        }

        if (inProgress.length === 0 && completed.length === 0) {
          inProgress.push({
            id: 1,
            title: "Тестовая незавершенная история",
            cover: "/default-cover.jpg",
            genre: "Фантастика",
            authorName: "Тестовый автор",
            isCompleted: false,
            updatedAt: new Date().toISOString(),
          });

          completed.push({
            id: 2,
            title: "Тестовая завершенная история",
            cover: "/default-cover.jpg",
            genre: "Приключения",
            authorName: "Другой автор",
            isCompleted: true,
            updatedAt: new Date(Date.now() - 86400000).toISOString(), // вчера
          });
        }

        statsData.games = { inProgress, completed };
      } catch (error) {
        console.error("Error loading playthroughs:", error);
        statsData.games = { inProgress: [], completed: [] };
      }
    }

    return statsData;
  },

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
