import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../shared/hooks/reduxHooks";
import { getAllStoriesThunk } from "../../entities/story/api/StoryApi";
import { UserRole } from "../../entities/user/model";
import { CLIENT_ROUTES } from "../../shared/enam/clientRouter";
import type { StoryData } from "../../entities/story/model";
import "./AllStoriesPage.css";

// Функция для получения базового URL сервера (без /api)
const getServerBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    return "http://localhost:4000";
  }
  return apiUrl.replace(/\/api$/, "");
};

// Компонент для обложки истории
function StoryCover({ cover, title }: { cover: string; title: string }) {
  return (
    <div className="story-cover">
      <img
        src={`${getServerBaseUrl()}/${cover}`}
        alt={title}
      />
    </div>
  );
}

// Компонент карточки истории
function StoryCard({
  story,
  isAuthor,
  isPlayer,
  user,
  onPlay,
  onDetails,
  onSignIn,
}: {
  story: StoryData;
  isAuthor: boolean;
  isPlayer: boolean;
  user: any;
  onPlay: (id: number) => void;
  onDetails: (id: number) => void;
  onSignIn: () => void;
}) {
  return (
    <div className="story-card">
      <StoryCover cover={story.cover} title={story.title} />
      
      <div className="story-content">
        <h3 className="story-title">{story.title}</h3>
        <p className="story-author">Автор: {story.authorName}</p>
        <p className="story-genre">Жанр: {story.genre}</p>
        <p className="story-description">
          {story.description.length > 100
            ? `${story.description.substring(0, 100)}...`
            : story.description}
        </p>
        
        <div className="story-status">
          <span className="status-badge published">Опубликовано</span>
        </div>
      </div>

      <div className="story-actions">
        {isPlayer && (
          <button className="btn btn-play" onClick={() => onPlay(story.id)}>
            Играть
          </button>
        )}

        {isAuthor && (
          <button className="btn btn-details" onClick={() => onDetails(story.id)}>
            Подробнее
          </button>
        )}

        {!user && (
          <button className="btn btn-play" onClick={onSignIn}>
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

  // Состояние для поиска и фильтров
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");

  // Получаем данные из Redux
  const { stories, isLoading, error } = useAppSelector(
    (state) => state.stories,
  );
  const { user } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(getAllStoriesThunk());
  }, [dispatch]);

  // Фильтруем только опубликованные истории
  const publishedStories = stories.filter((story) => story.isPublished);

  // Получаем уникальные жанры для фильтра
  const genres = useMemo(() => {
    const uniqueGenres = Array.from(
      new Set(publishedStories.map((story) => story.genre)),
    );
    return uniqueGenres.sort();
  }, [publishedStories]);

  // Фильтрация историй по поисковому запросу и жанру
  const filteredStories = useMemo(() => {
    return publishedStories.filter((story) => {
      if (selectedGenre && story.genre !== selectedGenre) {
        return false;
      }

      // Фильтр по поисковому запросу (название, автор, описание)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          story.title.toLowerCase().includes(query) ||
          story.authorName.toLowerCase().includes(query) ||
          story.description.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [publishedStories, searchQuery, selectedGenre]);

  // Определяем популярные истории (первые 4 по дате создания - самые новые)
  const popularStories = useMemo(() => {
    return [...filteredStories]
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 4);
  }, [filteredStories]);

  // Остальные истории (все кроме популярных)
  const otherStories = useMemo(() => {
    const popularIds = new Set(popularStories.map((s) => s.id));
    return filteredStories.filter((story) => !popularIds.has(story.id));
  }, [filteredStories, popularStories]);

  const isAuthor = user?.role === UserRole.AUTHOR;
  const isPlayer = user?.role === UserRole.USER;

  const handlePlay = (storyId: number) => {
    console.log("Играть в историю:", storyId);
  };

  const handleDetails = (storyId: number) => {
    console.log("Подробнее об истории:", storyId);
  };

  if (isLoading) {
    return (
      <div className="all-stories-page">
        <div className="loading-container">
          <div className="spell-loader"></div>
          <p>Загрузка историй...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="all-stories-page">
        <div className="error-message">
          <p>Ошибка: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="all-stories-page">
      {/* Поиск и фильтры */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Поиск по названию, автору или описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filter-wrapper">
            <select
              className="genre-select"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="">Все жанры</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Раздел "Популярное" */}
      {popularStories.length > 0 && (
        <section className="popular-section">
          <h2 className="section-title">
            <span className="title-icon">⭐</span>
            Популярное
          </h2>
          <div className="stories-grid">
            {popularStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                isAuthor={isAuthor}
                isPlayer={isPlayer}
                user={user}
                onPlay={handlePlay}
                onDetails={handleDetails}
                onSignIn={() => navigate(CLIENT_ROUTES.SIGN_IN)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Все остальные истории */}
      {otherStories.length === 0 && popularStories.length === 0 ? (
        <div className="no-stories">
          <p>
            {searchQuery || selectedGenre
              ? "Истории не найдены"
              : "Опубликованные истории пока не добавлены"}
          </p>
        </div>
      ) : (
        otherStories.length > 0 && (
          <section className="all-stories-section">
            <h2 className="section-title">
              <span className="title-icon">📚</span>
              Все истории
            </h2>
            <div className="stories-grid">
              {otherStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  isAuthor={isAuthor}
                  isPlayer={isPlayer}
                  user={user}
                  onPlay={handlePlay}
                  onDetails={handleDetails}
                  onSignIn={() => navigate(CLIENT_ROUTES.SIGN_IN)}
                />
              ))}
            </div>
          </section>
        )
      )}
    </div>
  );
}
