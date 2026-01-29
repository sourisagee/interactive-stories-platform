import axiosInstance from "@/shared/lib/axiosInstance";

// Краткая информация о прохождении истории игроком (для списка на «Все истории»)
export interface UserPlaythrough {
  id: number;
  isCompleted: boolean;
  story: {
    id: number;
    title: string;
    authorName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Полный ответ прохождения с текущим узлом (для страницы игры)
export interface PlaythroughWithNode {
  id: number;
  isCompleted: boolean;
  story: { id: number; title: string; authorName: string };
  currentNode: {
    id: number;
    picture: string;
    title: string;
    content: string;
    isStart: boolean;
    isEnd: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

function getData<T>(response: { data?: { data?: T }; data?: T }): T | null {
  if (response.data?.data !== undefined && response.data?.data !== null) {
    return response.data.data as T;
  }
  if (response.data !== undefined && response.data !== null && typeof response.data === "object") {
    return response.data as T;
  }
  return null;
}

export const playthroughApi = {
  // Получить все прохождения текущего пользователя (URL с «s»: /playthroughs/)
  getMyPlaythroughs: async (): Promise<UserPlaythrough[]> => {
    const response = await axiosInstance.get("/playthroughs/user/all");
    const raw = getData<unknown>(response);

    if (Array.isArray(raw)) {
      return raw as UserPlaythrough[];
    }
    if (raw && typeof raw === "object" && Array.isArray((raw as { playthroughs?: unknown }).playthroughs)) {
      return (raw as { playthroughs: UserPlaythrough[] }).playthroughs;
    }
    return [];
  },

  // Текущее прохождение по storyId (для восстановления после перезагрузки)
  getCurrentPlaythrough: async (storyId: number): Promise<PlaythroughWithNode | null> => {
    try {
      const response = await axiosInstance.get(`/playthroughs/current/${storyId}`);
      const data = getData<PlaythroughWithNode>(response);
      return data ?? null;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) return null;
      throw err;
    }
  },

  // Начать новое прохождение (создаёт запись на сервере)
  startPlaythrough: async (storyId: number): Promise<PlaythroughWithNode> => {
    const response = await axiosInstance.post("/playthroughs/start", { storyId });
    const data = getData<PlaythroughWithNode>(response);
    if (!data) throw new Error("Нет данных в ответе startPlaythrough");
    return data;
  },

  // Сделать выбор в узле (сохраняет прогресс на сервере)
  makeChoice: async (playthroughId: number, choiceId: number): Promise<PlaythroughWithNode> => {
    const response = await axiosInstance.post(`/playthroughs/${playthroughId}/choose`, { choiceId });
    const data = getData<PlaythroughWithNode>(response);
    if (!data) throw new Error("Нет данных в ответе makeChoice");
    return data;
  },
};

