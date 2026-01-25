import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../shared/hooks/reduxHooks";
import { getAllStoriesThunk } from "../../entities/story/api/StoryApi";
import { UserRole, type UserData } from "../../entities/user/model";
import { CLIENT_ROUTES, storyDetailPath, gamePlayPath } from "../../shared/enam/clientRouter";
import { getServerBaseUrl } from "../../shared/lib/getServerBaseUrl";
import type { StoryData } from "../../entities/story/model";
import "./AllStoriesPage.css";

/** Максимальная длина описания в карточке */
const DESC_PREVIEW_LEN = 100;

type StoryCardProps = {
  story: StoryData;
  user: UserData | null;
  onPlay: (id: number) => void; // Функция-колбэк для кнопки Играть (id истории)
  onDetails: (id: number) => void; // Функция-колбэк для кнопки Подробнее (id истории)
  onSignIn: () => void; // Функция-колбэк для кнопки Войти для игры
};

/** Карточка одной истории: обложка, описание, кнопки Играть / Подробнее / Войти */
function StoryCard({ story, user, onPlay, onDetails, onSignIn }: StoryCardProps) {
  const isAuthor = user?.role === UserRole.AUTHOR;
  const isPlayer = user?.role === UserRole.USER;
  const description =
    story.description.length > DESC_PREVIEW_LEN
      ? `${story.description.slice(0, DESC_PREVIEW_LEN)}...`
      : story.description;

  return (
    <div className="story-card">
      <div className="story-cover">
        <img src={`${getServerBaseUrl()}/${story.cover}`} alt={story.title} />
      </div>
      <div className="story-content">
        <h3 className="story-title">{story.title}</h3>
        <p className="story-author">Автор: {story.authorName}</p>
        <p className="story-genre">Жанр: {story.genre}</p>
        <p className="story-description">{description}</p>
      </div>
      <div className="story-actions">
        {isPlayer && (
          <button type="button" className="btn btn-primary" onClick={() => onPlay(story.id)}>
            Играть
          </button>
        )}
        {isAuthor && (
          <button type="button" className="btn btn-secondary" onClick={() => onDetails(story.id)}>
            Подробнее
          </button>
        )}
        {!user && (
          <button type="button" className="btn btn-primary" onClick={onSignIn}>
            Войти для игры
          </button>
        )}
      </div>
    </div>
  );
}

export default function AllStoriesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");

  const { stories, isLoading, error } = useAppSelector((state) => state.stories);
  const { user } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(getAllStoriesThunk());
  }, [dispatch]);

  /** Только опубликованные */
  const publishedStories = useMemo(
    () => stories.filter((s) => s.isPublished),
    [stories],
  );

  /** Для жанров */
  const genres = useMemo(() => { // рендер только при изменении publishedStories
    const set = new Set(publishedStories.map((s) => s.genre));
    return Array.from(set).sort();
  }, [publishedStories]);

  /** Иконки для жанров в фэнтези-стиле */
  const getGenreIcon = (genre: string): string => {
    const genreLower = genre.toLowerCase();
    if (genreLower.includes("фэнтези") || genreLower.includes("фентези")) return "⚔️";
    if (genreLower.includes("фантастик")) return "🌌";
    if (genreLower.includes("детектив")) return "🔍";
    if (genreLower.includes("роман") || genreLower.includes("любов")) return "💕";
    if (genreLower.includes("ужас") || genreLower.includes("хоррор")) return "👻";
    if (genreLower.includes("приключен")) return "🗺️";
    if (genreLower.includes("мистик")) return "🔮";
    if (genreLower.includes("историческ")) return "📜";
    if (genreLower.includes("комеди")) return "🎭";
    return "✨";
  };

  /** Подсчёт историй в каждом жанре */
  const getGenreCount = (genre: string): number => {
    return publishedStories.filter((s) => s.genre === genre).length;
  };

  /** Строка поиска */
  const filteredStories = useMemo(() => {
    return publishedStories.filter((story) => {
      if (selectedGenre && story.genre !== selectedGenre) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        story.title.toLowerCase().includes(q) ||
        story.authorName.toLowerCase().includes(q) ||
        story.description.toLowerCase().includes(q)
      );
    });
  }, [publishedStories, searchQuery, selectedGenre]);

  const hasStories = filteredStories.length > 0;
  const hasFilters = Boolean(searchQuery.trim() || selectedGenre);

  const handlePlay = (id: number) => navigate(gamePlayPath(id)); /** Навигация для игры */
  const handleDetails = (id: number) => navigate(storyDetailPath(id)); /** Смотреть детали */

  const goToSignIn = () => navigate(CLIENT_ROUTES.SIGN_IN);

  if (isLoading) {
    return (
      <div className="all-stories-page">
        <div className="cosmic-bg" aria-hidden />
        <div className="loading-container">
          <div className="spell-loader" />
          <p>Загрузка историй...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="all-stories-page">
        <div className="cosmic-bg" aria-hidden />
        <div className="error-message">
          <p>Ошибка: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="all-stories-page">
      <div className="cosmic-bg" aria-hidden />
      <div className="all-stories-layout">
        {/* Все жанры */}
        <aside className="genres-sidebar">
          <h3 className="genres-title">
            <span className="title-icon title-icon-cosmic" aria-hidden />
            Жанры
          </h3>
          <div className="genres-list">
            <button
              type="button"
              className={`genre-button ${selectedGenre === "" ? "active" : ""}`}
              onClick={() => setSelectedGenre("")}
            >
              <div className="genre-left">
                <span className="genre-icon">🌟</span>
                <span className="genre-text">Все жанры</span>
              </div>
              <span className="genre-count">{publishedStories.length}</span>
            </button>
            <div className="genre-divider genre-divider-main" />
            {genres.map((genre, index) => (
              <div key={genre}>
                {index > 0 && <div className="genre-divider" />}
                <button
                  type="button"
                  className={`genre-button ${selectedGenre === genre ? "active" : ""}`}
                  onClick={() => setSelectedGenre(genre)}
                >
                  <div className="genre-left">
                    <span className="genre-icon">{getGenreIcon(genre)}</span>
                    <span className="genre-text">{genre}</span>
                  </div>
                  <span className="genre-count">{getGenreCount(genre)}</span>
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Строка поиска */}
        <main className="stories-main">
          <div className="search-section">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input input-base"
                placeholder="Поиск по названию, автору или описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {!hasStories ? (
            <div className="no-stories">
              <p>
                {hasFilters ? "Истории не найдены" : "Опубликованные истории пока не добавлены"}
              </p>
            </div>
          ) : (
            <section className="all-stories-section">
              <h2 className="section-title">
                <span className="title-icon title-icon-cosmic" aria-hidden />
                Все истории
              </h2>
              <div className="stories-grid">
                {filteredStories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    user={user}
                    onPlay={handlePlay}
                    onDetails={handleDetails}
                    onSignIn={goToSignIn}
                  />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
