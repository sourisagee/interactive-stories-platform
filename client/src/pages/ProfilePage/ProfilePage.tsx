import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../shared/hooks/reduxHooks";
import { UserRole } from "@/entities/user/model";
import { gamePlayPath, storyDetailPath } from "../../shared/enam/clientRouter";
import {
  profileApi,
  type UserProfileResponse,
  type GameInfo,
  type AuthorStory,
} from "../../entities/user/api/ProfileApi";
import "./ProfilePage.css";
import { editStoryPath } from "@/shared/enam/clientRouter";
import { useNavigate } from "react-router";
import CreateStoryModal from "../../shared/components/CreateStoryModal/CreateStoryModal";
import axiosInstance from "@/shared/lib/axiosInstance";
import { getServerBaseUrl, getCoverImageSrc } from "../../shared/lib/getServerBaseUrl";

export default function ProfilePage() {
  const { user, isLoading } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const navigate = useNavigate();

  const handleCreateNewStory = () => {
    setIsCreateModalOpen(true);
  };

  const handleStoryCreated = (newStory: { id: number }) => {
    // Перенаправляем в редактор новой истории
    navigate(editStoryPath(newStory.id));
    // Обновляем профиль, чтобы новая история появилась в списке черновиков
    loadProfile();
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      const profileData = await profileApi.getMyProfile();
      setProfile(profileData);
    } catch (error) {
      console.error("Ошибка загрузки профиля:", error);
      setProfileError(`Ошибка загрузки профиля: ${error}`);
    } finally {
      setProfileLoading(false);
    }
  };

  const renderGameCard = (
    game: GameInfo,
    actionType: "continue" | "replay"
  ) => (
    <div key={game.id} className="profile-game-card">
      <div className="profile-game-cover">
        <img src={getCoverImageSrc(game.cover)} alt={game.title} />
      </div>
      <div className="profile-game-content">
        <h3 className="profile-game-title">{game.title}</h3>
        <p className="profile-game-author">Автор: {game.authorName}</p>
        <p className="profile-game-genre">Жанр: {game.genre}</p>
        {game.description && (
          <p className="profile-game-description">{game.description}</p>
        )}
        <p className="profile-game-updated">
          Обновлено: {new Date(game.updatedAt).toLocaleDateString("ru-RU")}
        </p>
      </div>
      <div className="profile-game-actions">
        <Link to={gamePlayPath(game.id)} className="btn btn-primary">
          {actionType === "continue" ? "Продолжить игру" : "Пройти еще раз"}
        </Link>
      </div>
    </div>
  );

  const renderAuthorStoryCard = (story: AuthorStory, isDraft: boolean) => (
    <div key={story.id} className={`story-card ${isDraft ? "story-card--draft" : "story-card--published"}`}>
      <div className="story-cover">
        <img src={getCoverImageSrc(story.cover)} alt={story.title} />
      </div>
      <div className="story-info">
        <h4 className="story-title">{story.title}</h4>
        <p className="story-author">Автор: {user?.username ?? ""}</p>
        <p className="story-genre">Жанр: {story.genre}</p>
        <p className="story-description">{story.description}</p>
        <p className="story-updated">
          Обновлено: {new Date(story.updatedAt).toLocaleDateString("ru-RU")}
        </p>
        {isDraft ? (
          <div className="story-actions">
            <Link
              to={`/story/edit/${story.id}`}
              className="story-action-btn btn-edit"
            >
              Редактировать
            </Link>
            <button
              className="story-action-btn btn-publish"
              onClick={() => handlePublishStory(story.id)}
            >
              Опубликовать
            </button>
            <button
              className="story-action-btn btn-delete"
              onClick={() => handleDeleteStory(story.id)}
            >
              Удалить
            </button>
          </div>
        ) : (
          <div className="story-actions">
            <Link
              to={storyDetailPath(story.id)}
              className="story-action-btn btn-details"
            >
              Подробнее
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  const handlePublishStory = async (storyId: number) => {
    try {
      // Импортируем updateStoryThunk динамически
      const { updateStoryThunk } = await import(
        "../../entities/story/api/StoryApi"
      );

      await dispatch(
        updateStoryThunk({
          storyId,
          updates: { isPublished: true },
        })
      ).unwrap();

      // Обновляем профиль, чтобы история переместилась из черновиков в опубликованные
      await loadProfile();
    } catch (error) {
      console.error("Ошибка при публикации истории:", error);
      alert("Не удалось опубликовать историю. Попробуйте еще раз.");
    }
  };

  const handleDeleteStory = async (storyId: number) => {
    if (
      !confirm(
        "Вы уверены, что хотите удалить эту историю? Это действие нельзя отменить."
      )
    ) {
      return;
    }

    try {
      // Нужно создать deleteStoryThunk, так как его нет в API
      const response = await axiosInstance.delete(`/stories/${storyId}`);

      if (response.status === 200) {
        // Обновляем профиль, чтобы удаленная история исчезла из списка
        loadProfile();
      }
    } catch (error) {
      console.error("Ошибка при удалении истории:", error);
      alert("Не удалось удалить историю. Попробуйте еще раз.");
    }
  };

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="cosmic-bg" aria-hidden />
        <div className="profile profile-loading">
          <p className="loading">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="cosmic-bg" aria-hidden />
        <div className="profile profile-error">
          <p className="error">Пользователь не найден</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="cosmic-bg" aria-hidden />
      <div className="profile">
        {user.role === UserRole.AUTHOR && (
          <header className="profile-header">
            <button
              type="button"
              className="btn btn-primary profile-create-btn"
              onClick={handleCreateNewStory}
            >
              Создать историю
            </button>
          </header>
        )}

        {user.role === UserRole.USER ? (
          <div className="profile-content profile-content-player">
            {/* Ряд 1: Информация о пользователе / Статистика */}
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
                <strong>Роль:</strong> Игрок
              </p>
            </div>

            <div className="profile-statistics">
              <h3>Статистика</h3>

              {profileLoading && (
                <div className="loading">Загрузка статистики...</div>
              )}

              {profileError && <div className="error">{profileError}</div>}

              {profile && !profileLoading && profile.playerStats ? (
                <div className="player-stats">
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-number">
                        {profile.playerStats.completedStories}
                      </span>
                      <span className="stat-label">Пройдено историй</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">
                        {profile.playerStats.inProgressStories}
                      </span>
                      <span className="stat-label">Незавершенные истории</span>
                    </div>
                    <div className="stat-item stat-item-date">
                      <span className="stat-label">В игре с</span>
                      <span className="stat-number">
                        {new Date(
                          profile.playerStats.memberSince
                        ).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                !profileLoading && <div>Нет данных для отображения</div>
              )}
            </div>

            {/* Ряд 2: Незавершенные игры / Завершенные игры */}
            <div className="games-section">
              <h3>Незавершенные игры</h3>
              <div className="games-list">
                {profile?.games?.inProgress &&
                profile.games.inProgress.length > 0 ? (
                  profile.games.inProgress.map((game) =>
                    renderGameCard(game, "continue")
                  )
                ) : (
                  <div className="no-games-message">
                    <p>Пока нет незавершенных игр</p>
                    <p>Начните играть в истории, чтобы они появились здесь!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="games-section">
              <h3>Завершенные игры</h3>
              <div className="games-list">
                {profile?.games?.completed &&
                profile.games.completed.length > 0 ? (
                  profile.games.completed.map((game) =>
                    renderGameCard(game, "replay")
                  )
                ) : (
                  <div className="no-games-message">
                    <p>Пока нет завершенных игр</p>
                    <p>
                      Завершите прохождение историй, чтобы они появились здесь!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="profile-content">
            <div className="profile-left">
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
                  <strong>Роль:</strong> Автор
                </p>
              </div>

              {/* Черновики для авторов */}
              <div className="stories-section">
                <h3>Черновики</h3>
                <div className="stories-list">
                  {profile?.authorStories?.drafts &&
                  profile.authorStories.drafts.length > 0 ? (
                    profile.authorStories.drafts.map((story) =>
                      renderAuthorStoryCard(story, true)
                    )
                  ) : (
                    <div className="no-stories-message">
                      <p>Пока нет черновиков</p>
                      <p>Создайте новую историю, чтобы она появилась здесь!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="profile-right">
              <div className="profile-statistics">
                <h3>Статистика</h3>

                {profileLoading && (
                  <div className="loading">Загрузка статистики...</div>
                )}

                {profileError && <div className="error">{profileError}</div>}

                {profile && !profileLoading && profile.authorStats ? (
                  <div className="author-stats">
                    <div className="stats-grid">
                      <div className="stat-item">
                        <span className="stat-number">
                          {profile.authorStats.totalStories}
                        </span>
                        <span className="stat-label">Создано историй</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">
                          {profile.authorStats.draftStories}
                        </span>
                        <span className="stat-label">В разработке</span>
                      </div>
                      <div className="stat-item stat-item-date">
                        <span className="stat-label">Автор с</span>
                        <span className="stat-number">
                          {new Date(
                            profile.authorStats.memberSince
                          ).toLocaleDateString("ru-RU")}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  !profileLoading && <div>Нет данных для отображения</div>
                )}
              </div>

              {/* Опубликованные истории для авторов */}
              <div className="stories-section">
                <h3>Опубликованные истории</h3>
                <div className="stories-list">
                  {profile?.authorStories?.published &&
                  profile.authorStories.published.length > 0 ? (
                    profile.authorStories.published.map((story) =>
                      renderAuthorStoryCard(story, false)
                    )
                  ) : (
                    <div className="no-stories-message">
                      <p>Пока нет опубликованных историй</p>
                      <p>Опубликуйте черновики, чтобы они появились здесь!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно для создания истории */}
      {user?.role === UserRole.AUTHOR && (
        <CreateStoryModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onStoryCreated={handleStoryCreated}
          authorName={user.username}
        />
      )}

      <footer className="main-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Интерактивные новеллы</h4>
              <p>
                Платформа для создания и чтения интерактивных историй нового
                поколения.
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              &copy; 2026 Интерактивные новеллы. Создано с ❤️ для любителей
              хороших историй.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
