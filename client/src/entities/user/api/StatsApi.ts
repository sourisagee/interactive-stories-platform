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

export interface GameInfo {
  id: number;
  title: string;
  cover: string;
  genre: string;
  authorName: string;
  isCompleted: boolean;
  updatedAt: string; // ISO date string
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
  // Получить мою статистику
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

    // Если это игрок, получаем также его прохождения
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

        // Безопасная проверка на массив
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

        // ВРЕМЕННО: добавляем тестовые данные для проверки
        if (inProgress.length === 0 && completed.length === 0) {
          // Тестовая незавершенная игра
          inProgress.push({
            id: 1,
            title: "Тестовая незавершенная история",
            cover: "/default-cover.jpg",
            genre: "Фантастика",
            authorName: "Тестовый автор",
            isCompleted: false,
            updatedAt: new Date().toISOString(),
          });

          // Тестовая завершенная игра
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

  // ВРЕМЕННАЯ функция для тестирования автора
  getAuthorTestData: (): UserStatsResponse => {
    return {
      user: {
        id: 1,
        username: "Тестовый автор",
        email: "author@test.com",
        role: "AUTHOR",
      },
      authorStats: {
        totalStories: 5,
        draftStories: 2,
        memberSince: "2024-01-01T00:00:00.000Z",
      },
      authorStories: {
        drafts: [
          {
            id: 1,
            title: "Незавершенная история 1",
            cover: "/default-cover.jpg",
            genre: "Фантастика",
            description: "Описание незавершенной истории...",
            isPublished: false,
            createdAt: "2024-01-15T00:00:00.000Z",
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            title: "Черновик приключения",
            cover: "/default-cover.jpg",
            genre: "Приключения",
            description: "Еще одна незавершенная история...",
            isPublished: false,
            createdAt: "2024-01-10T00:00:00.000Z",
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        published: [
          {
            id: 3,
            title: "Опубликованная история 1",
            cover: "/default-cover.jpg",
            genre: "Детектив",
            description: "Захватывающий детектив...",
            isPublished: true,
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-20T00:00:00.000Z",
          },
          {
            id: 4,
            title: "Популярная история",
            cover: "/default-cover.jpg",
            genre: "Романтика",
            description: "Романтическая история...",
            isPublished: true,
            createdAt: "2023-12-15T00:00:00.000Z",
            updatedAt: "2024-01-18T00:00:00.000Z",
          },
        ],
      },
    };
  },
};
