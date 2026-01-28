import { useEffect, useState } from "react";
import { useAppSelector } from "../../shared/hooks/reduxHooks";
import { UserRole } from "@/entities/user/model";
import {
  statsApi,
  type UserStatsResponse,
} from "../../entities/user/api/StatsApi";
import "./ProfilePage.css";
import { editStoryPath } from "@/shared/enam/clientRouter";
import { useNavigate } from "react-router";
import { useStoryEditorActions } from "@/shared/hooks/storyEditorHooks";

export default function ProfilePage() {
  const { user, isLoading } = useAppSelector((state) => state.user);
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const navigate = useNavigate();

  const { createStory } = useStoryEditorActions();

  const handleCreateNewStory = async () => {
    try {
      const { payload } = await createStory({
        title: "Новая история",
        genre: "Новая история",
        description: "Новая история",
        cover: "Новая история",
        authorName: user?.username || "",
      });

      if (payload && typeof payload === "object" && "id" in payload) {
        navigate(editStoryPath(payload.id));
      }

      // if (response) {
      //   navigate(storyEditorPath(response.id))
      // }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const statsData = await statsApi.getMyStats();
      setStats(statsData);
    } catch (error) {
      setStatsError(`Ошибка загрузки статистики: ${error}`);
    } finally {
      setStatsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!user) {
    return <div className="error">Пользователь не найден</div>;
  }

  return (
    <div className="profile">
      <h2>Профиль</h2>
      <button onClick={handleCreateNewStory}>Создать историю</button>

      <div className="profile-content">
        <div className="profile-info">
          <h3>Информация о пользователе</h3>
          <p>
            <strong>ID:</strong> {user.id}
          </p>
          <p>
            <strong>Имя:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Роль:</strong>{" "}
            {user.role === UserRole.AUTHOR ? "Автор" : "Игрок"}
          </p>
        </div>

        <div className="profile-statistics">
          <h3>Статистика</h3>

          {statsLoading && (
            <div className="loading">Загрузка статистики...</div>
          )}

          {statsError && <div className="error">{statsError}</div>}

          {stats && !statsLoading && (
            <>
              {stats.user.role === "AUTHOR" && stats.authorStats ? (
                <div className="author-stats">
                  <div className="stats-grid">
                    <div className="stat-item">
                      <p className="stat-label">Создано историй</p>
                      <span className="stat-number">
                        {stats.authorStats.totalStories}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">
                        <p className="stat-label">В разработке</p>
                        {stats.authorStats.draftStories}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Автор с</span>
                      <span className="stat-number">
                        {new Date(
                          stats.authorStats.memberSince,
                        ).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  </div>
                </div>
              ) : stats.user.role === "USER" && stats.playerStats ? (
                <div className="player-stats">
                  <div className="stats-grid">
                    <div className="stat-item">
                      <p className="stat-label">Пройдено историй</p>
                      <span className="stat-number">
                        {stats.playerStats.completedStories}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">
                        <p className="stat-label">Незавершенные истории</p>
                        {stats.playerStats.inProgressStories}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">
                        <p className="stat-label">В игре с</p>
                        {new Date(
                          stats.playerStats.memberSince,
                        ).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>Нет данных для отображения</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
