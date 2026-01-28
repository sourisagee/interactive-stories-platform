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

export interface GameInfo {
  id: number;
  title: string;
  cover: string;
  genre: string;
  authorName: string;
  isCompleted: boolean;
  updatedAt: string; // ISO date string
}

export interface UserProfileResponse {
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

export const profileApi = {
  // Получить мой профиль
  getMyProfile: async (): Promise<UserProfileResponse> => {
    const response = await axiosInstance.get("/profile/my");
    let profileData;

    if (response.data?.data) {
      profileData = response.data.data;
    } else if (response.data) {
      profileData = response.data;
    } else {
      throw new Error("No data in response");
    }

    // Если это игрок, получаем также его прохождения
    if (profileData.user.role === "USER") {
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

        profileData.games = { inProgress, completed };
      } catch (error) {
        console.error("Error loading playthroughs:", error);
        profileData.games = { inProgress: [], completed: [] };
      }
    }

    // Если это автор, добавляем тестовые истории для проверки UI
    if (profileData.user.role === "AUTHOR") {
      // ВРЕМЕННО: добавляем тестовые данные для авторов
      const drafts: AuthorStory[] = [
        {
          id: 1,
          title: "Тестовый черновик 1",
          cover: "/default-cover.jpg",
          genre: "Фантастика",
          description: "Описание тестового черновика для проверки UI",
          isPublished: false,
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 дня назад
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: "Тестовый черновик 2",
          cover: "/default-cover.jpg",
          genre: "Приключения",
          description: "Еще один тестовый черновик",
          isPublished: false,
          createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 дня назад
          updatedAt: new Date(Date.now() - 86400000).toISOString(), // вчера
        },
      ];

      const published: AuthorStory[] = [
        {
          id: 3,
          title: "Опубликованная история 1",
          cover: "/default-cover.jpg",
          genre: "Детектив",
          description: "Тестовая опубликованная история",
          isPublished: true,
          createdAt: new Date(Date.now() - 604800000).toISOString(), // неделю назад
          updatedAt: new Date(Date.now() - 432000000).toISOString(), // 5 дней назад
        },
        {
          id: 4,
          title: "Опубликованная история 2",
          cover: "/default-cover.jpg",
          genre: "Романтика",
          description: "Еще одна опубликованная история",
          isPublished: true,
          createdAt: new Date(Date.now() - 1209600000).toISOString(), // 2 недели назад
          updatedAt: new Date(Date.now() - 864000000).toISOString(), // 10 дней назад
        },
      ];

      profileData.authorStories = { drafts, published };

      // Также добавляем тестовую статистику для автора
      if (!profileData.authorStats) {
        profileData.authorStats = {
          totalStories: drafts.length + published.length,
          draftStories: drafts.length,
          memberSince: new Date(Date.now() - 2592000000).toISOString(), // месяц назад
        };
      }
    }

    return profileData;
  },

  // Получить профиль пользователя по ID
  getUserProfile: async (userId: number): Promise<UserProfileResponse> => {
    const response = await axiosInstance.get(`/profile/user/${userId}`);

    if (response.data?.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    } else {
      throw new Error("No data in response");
    }
  },
};
