import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../shared/hooks/reduxHooks";
import { UserRole } from "@/entities/user/model";
import { gamePlayPath } from "../../shared/enam/clientRouter";
import {
  profileApi,
  type UserProfileResponse,
  type GameInfo,
  type AuthorStory,
} from "../../entities/user/api/ProfileApi";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user, isLoading } = useAppSelector((state) => state.user);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

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
      setProfileError(`Ошибка загрузки профиля: ${error}`);
    } finally {
      setProfileLoading(false);
    }
  };

  const renderGameCard = (
    game: GameInfo,
    actionType: "continue" | "replay"
  ) => (
    <div key={game.id} className="game-card">
      <div className="game-cover">
        <img src={game.cover} alt={game.title} />
      </div>
      <div className="game-info">
        <h4 className="game-title">{game.title}</h4>
        <p className="game-author">Автор: {game.authorName}</p>
        <p className="game-genre">{game.genre}</p>
        <p className="game-updated">
          Обновлено: {new Date(game.updatedAt).toLocaleDateString("ru-RU")}
        </p>
        <Link
          to={gamePlayPath(game.id)}
          className={`game-action-btn ${
            actionType === "continue" ? "btn-continue" : "btn-replay"
          }`}
        >
          {actionType === "continue" ? "Продолжить игру" : "Пройти еще раз"}
        </Link>
      </div>
    </div>
  );

  const renderAuthorStoryCard = (story: AuthorStory, isDraft: boolean) => (
    <div key={story.id} className="story-card">
      <div className="story-cover">
        <img src={story.cover} alt={story.title} />
      </div>
      <div className="story-info">
        <h4 className="story-title">{story.title}</h4>
        <p className="story-genre">{story.genre}</p>
        <p className="story-description">{story.description}</p>
        <p className="story-updated">
          Обновлено: {new Date(story.updatedAt).toLocaleDateString("ru-RU")}
        </p>
        {isDraft && (
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
        )}
      </div>
    </div>
  );

  const handlePublishStory = (storyId: number) => {
    console.log("Опубликовать историю:", storyId);
    // TODO: Реализовать публикацию истории
  };

  const handleDeleteStory = (storyId: number) => {
    if (confirm("Вы уверены, что хотите удалить эту историю?")) {
      console.log("Удалить историю:", storyId);
      // TODO: Реализовать удаление истории
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
              <strong>Роль:</strong>{" "}
              {user.role === UserRole.AUTHOR ? "Автор" : "Игрок"}
            </p>
          </div>

          {/* Незавершенные игры для игроков */}
          {user.role === UserRole.USER && (
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
          )}

          {/* Черновики для авторов */}
          {user.role === UserRole.AUTHOR && (
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
          )}
        </div>

        <div className="profile-right">
          <div className="profile-statistics">
            <h3>Статистика</h3>

            {profileLoading && (
              <div className="loading">Загрузка статистики...</div>
            )}

            {profileError && <div className="error">{profileError}</div>}

            {profile && !profileLoading && (
              <>
                {profile.user.role === "AUTHOR" && profile.authorStats ? (
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
                      <div className="stat-item">
                        <span className="stat-number">
                          {new Date(
                            profile.authorStats.memberSince
                          ).toLocaleDateString("ru-RU")}
                        </span>
                        <span className="stat-label">Автор с</span>
                      </div>
                    </div>
                  </div>
                ) : profile.user.role === "USER" && profile.playerStats ? (
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
                        <span className="stat-label">
                          Незавершенные истории
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">
                          {new Date(
                            profile.playerStats.memberSince
                          ).toLocaleDateString("ru-RU")}
                        </span>
                        <span className="stat-label">В игре с</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>Нет данных для отображения</div>
                )}
              </>
            )}
          </div>

          {/* Завершенные игры для игроков */}
          {user.role === UserRole.USER && (
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
          )}

          {/* Опубликованные истории для авторов */}
          {user.role === UserRole.AUTHOR && (
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
          )}
        </div>
      </div>
    </div>
  );
}
