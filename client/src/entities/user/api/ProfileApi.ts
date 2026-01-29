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
  description: string;
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
                genre: playthrough.story.genre ?? "",
                description: playthrough.story.description ?? "",
                authorName: playthrough.story.authorName ?? "",
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
            description: "Тестовое описание",
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
            description: "Тестовое описание",
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

    // Если это автор, получаем его истории из backend
    if (profileData.user.role === "AUTHOR") {
      console.log("Загружаем истории автора...");
      try {
        // Используем существующий метод из StoryApi
        const { default: StoryApi } = await import(
          "../../../entities/story/api/StoryApi"
        );
        const stories = await StoryApi.getMyStories();

        console.log("Обработанные истории:", stories);
        console.log("Количество историй:", stories.length);

        const drafts: AuthorStory[] = [];
        const published: AuthorStory[] = [];

        stories.forEach((story, index) => {
          console.log(`Обрабатываем историю ${index + 1}:`, {
            id: story.id,
            title: story.title,
            isPublished: story.isPublished,
            typeof_isPublished: typeof story.isPublished,
          });

          const authorStory: AuthorStory = {
            id: story.id,
            title: story.title,
            cover: story.cover || "/default-cover.jpg",
            genre: story.genre,
            description: story.description,
            isPublished: story.isPublished,
            createdAt: story.createdAt,
            updatedAt: story.updatedAt,
          };

          console.log(
            `История ${story.title} - опубликована: ${story.isPublished}`
          );

          if (story.isPublished) {
            console.log(`Добавляем в опубликованные: ${story.title}`);
            published.push(authorStory);
          } else {
            console.log(`Добавляем в черновики: ${story.title}`);
            drafts.push(authorStory);
          }
        });

        console.log("Черновики:", drafts);
        console.log("Опубликованные:", published);
        console.log("Количество черновиков:", drafts.length);
        console.log("Количество опубликованных:", published.length);

        profileData.authorStories = { drafts, published };

        // Обновляем статистику на основе реальных данных
        if (profileData.authorStats) {
          profileData.authorStats.totalStories = stories.length;
          profileData.authorStats.draftStories = drafts.length;
        }
      } catch (error) {
        console.error("Error loading author stories:", error);
        console.error("Детали ошибки:", error.response?.data || error.message);

        // Временно не используем fallback, чтобы увидеть реальную ошибку
        profileData.authorStories = { drafts: [], published: [] };

        if (!profileData.authorStats) {
          profileData.authorStats = {
            totalStories: 0,
            draftStories: 0,
            memberSince: new Date(Date.now() - 2592000000).toISOString(),
          };
        }
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
