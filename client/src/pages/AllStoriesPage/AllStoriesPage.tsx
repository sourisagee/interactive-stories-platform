import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAppDispatch, useAppSelector } from "../../shared/hooks/reduxHooks";
import { getAllStoriesThunk } from "../../entities/story/api/StoryApi";
import { playthroughApi, type UserPlaythrough } from "../../entities/story/api/PlaythroughApi";
import {
  getPopularStoriesThunk,
  getStoryRatingThunk,
  type PopularStory,
  type StoryRatingInfo,
} from "../../entities/rating/api/RatingApi";
import { UserRole, type UserData } from "../../entities/user/model";
import { CLIENT_ROUTES, storyDetailPath, gamePlayPath } from "../../shared/enam/clientRouter";
import { getServerBaseUrl } from "../../shared/lib/getServerBaseUrl";
import type { StoryData } from "../../entities/story/model";
import StarRating from "../../shared/components/StarRating/StarRating";
import RatingModal from "../../shared/components/RatingModal/RatingModal";
import "./AllStoriesPage.css";

/** Максимальная длина описания в карточке */
const DESC_PREVIEW_LEN = 100;

type StoryCardProps = {
  story: StoryData;
  user: UserData | null;
  ratingInfo?: StoryRatingInfo;
  isPopular?: boolean;
  showPopularBadge?: boolean; // Показывать ли значок популярности
  // Флаг: есть ли у текущего игрока незавершённое прохождение этой истории
  isInProgress?: boolean;
  onPlay: (id: number) => void;
  onDetails: (id: number) => void;
  onSignIn: () => void;
  onRatingChange?: (storyId: number, ratingInfo: StoryRatingInfo) => void;
};

/** Карточка одной истории: обложка, описание, рейтинг, кнопки Играть / Подробнее / Войти */
function StoryCard({
  story,
  user,
  ratingInfo,
  isPopular = false,
  showPopularBadge = false,
  isInProgress = false,
  onPlay,
  onDetails,
  onSignIn,
  onRatingChange,
}: StoryCardProps) {
  const isAuthor = user?.role === UserRole.AUTHOR;
  const isPlayer = user?.role === UserRole.USER;
  // Кнопка "Оценить" только для игроков (не авторов) и только если пользователь не автор истории
  const canRate = isPlayer && story.authorId !== user?.id;
  const hasRated = !!ratingInfo && ratingInfo.userRating !== null && ratingInfo.userRating !== undefined;
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const description =
    story.description.length > DESC_PREVIEW_LEN
      ? `${story.description.slice(0, DESC_PREVIEW_LEN)}...`
      : story.description;

  const handleRatingSubmitted = (newRatingInfo: StoryRatingInfo) => {
    if (onRatingChange) {
      onRatingChange(story.id, newRatingInfo);
    }
  };

  return (
    <>
      <div className={`story-card ${showPopularBadge ? "story-card-popular" : ""}`}>
        {/* Закладка "Продолжить чтение" для историй с незавершённым прохождением */}
        {isPlayer && isInProgress && (
          <div className="story-badge-continue">
            Продолжить чтение
          </div>
        )}

        {showPopularBadge && (
          <div className="story-card-popular-badge" aria-label="Популярная история">
            <span className="popular-icon">✦</span>
          </div>
        )}
        <div className="story-cover">
          <img src={`${getServerBaseUrl()}/${story.cover}`} alt={story.title} />
        </div>
        <div className="story-content">
          <h3 className="story-title">{story.title}</h3>
          <p className="story-author">Автор: {story.authorName}</p>
          <p className="story-genre">Жанр: {story.genre}</p>
          <p className="story-description">{description}</p>
          {(ratingInfo || canRate) && (
            <div className="story-rating">
              {ratingInfo && (
                <StarRating
                  averageRating={ratingInfo.averageRating}
                  totalRatings={ratingInfo.totalRatings}
                />
              )}
              {canRate && (
                <button
                  type="button"
                  className={`btn btn-rating ${hasRated ? "btn-rating-rated" : ""}`}
                  onClick={() => setIsRatingModalOpen(true)}
                  disabled={hasRated}
                >
                  {hasRated ? "✓ Оценено" : "Оценить"}
                </button>
              )}
            </div>
          )}
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
      {canRate && (
        <RatingModal
          storyId={story.id}
          storyTitle={story.title}
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </>
  );
}

export default function AllStoriesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [popularStories, setPopularStories] = useState<PopularStory[]>([]);
  const [storyRatings, setStoryRatings] = useState<
    Record<number, StoryRatingInfo>
  >({});
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  // Список всех прохождений пользователя (нужен, чтобы понять, какие истории "в процессе")
  const [userPlaythroughs, setUserPlaythroughs] = useState<UserPlaythrough[]>([]);

  const { stories, isLoading, error } = useAppSelector((state) => state.stories);
  const { user } = useAppSelector((state) => state.user);

  // Загрузка всех историй
  useEffect(() => {
    dispatch(getAllStoriesThunk());
  }, [dispatch]);

  // Загрузка всех прохождений текущего пользователя
  // Нужна, чтобы определить, какие истории были начаты, но ещё не завершены
  useEffect(() => {
    if (!user) {
      setUserPlaythroughs([]);
      return;
    }
    // Загружаем прохождения для игроков (USER); при необходимости можно расширить
    if (user.role !== UserRole.USER) {
      setUserPlaythroughs([]);
      return;
    }

    const loadPlaythroughs = async () => {
      try {
        const playthroughs = await playthroughApi.getMyPlaythroughs();
        setUserPlaythroughs(Array.isArray(playthroughs) ? playthroughs : []);
      } catch (e) {
        console.error("Ошибка загрузки прохождений пользователя", e);
        setUserPlaythroughs([]);
      }
    };

    loadPlaythroughs();
    // Перезагружаем при возврате на страницу списка (чтобы закладка «Продолжить чтение» обновилась)
  }, [user, location.pathname]);

  // Загрузка популярных историй
  useEffect(() => {
    const loadPopularStories = async () => {
      setIsLoadingPopular(true);
      try {
        const popular = await dispatch(getPopularStoriesThunk(4)).unwrap();
        setPopularStories(popular);
        // Загружаем рейтинги для популярных историй
        const ratingPromises = popular.map((story) =>
          dispatch(getStoryRatingThunk(story.id))
            .unwrap()
            .then((rating) => ({ storyId: story.id, rating }))
            .catch(() => null)
        );
        const ratings = await Promise.all(ratingPromises);
        ratings.forEach((item) => {
          if (item) {
            setStoryRatings((prev) => ({
              ...prev,
              [item.storyId]: item.rating,
            }));
          }
        });
      } catch (error) {
        console.error("Ошибка загрузки популярных историй:", error);
      } finally {
        setIsLoadingPopular(false);
      }
    };
    loadPopularStories();
  }, [dispatch]);

  // Загрузка рейтингов для всех историй при изменении списка
  useEffect(() => {
    const loadRatings = async () => {
      const publishedIds = stories
        .filter((s) => s.isPublished)
        .map((s) => s.id);
      
      // Загружаем рейтинги только для историй, у которых еще нет рейтинга
      const idsToLoad = publishedIds.filter((id) => !storyRatings[id]);
      
      if (idsToLoad.length === 0) return;
      
      const ratingPromises = idsToLoad.map((id) =>
        dispatch(getStoryRatingThunk(id))
          .unwrap()
          .then((rating) => ({ storyId: id, rating }))
          .catch((error) => {
            // Игнорируем ошибки 400/404 - просто нет рейтинга
            console.debug(`Рейтинг для истории ${id} не найден`);
            return null;
          })
      );
      
      const ratings = await Promise.all(ratingPromises);
      const ratingsMap: Record<number, StoryRatingInfo> = {};
      ratings.forEach((item) => {
        if (item) {
          ratingsMap[item.storyId] = item.rating;
        }
      });
      setStoryRatings((prev) => ({ ...prev, ...ratingsMap }));
    };

    if (stories.length > 0) {
      loadRatings();
    }
  }, [stories, dispatch, storyRatings]);

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

  const handlePlay = (id: number) => navigate(gamePlayPath(id));
  const handleDetails = (id: number) => navigate(storyDetailPath(id));
  const goToSignIn = () => navigate(CLIENT_ROUTES.SIGN_IN);

  const handleRatingChange = (storyId: number, ratingInfo: StoryRatingInfo) => {
    setStoryRatings((prev) => ({
      ...prev,
      [storyId]: ratingInfo,
    }));
    // Обновляем популярные истории, если изменился рейтинг
    setPopularStories((prev) =>
      prev.map((story) =>
        story.id === storyId
          ? { ...story, averageRating: ratingInfo.averageRating, totalRatings: ratingInfo.totalRatings }
          : story
      )
    );
  };

  // Множество id историй, у которых есть незавершённое прохождение
  // isCompleted === false => историю можно "продолжить"
  const inProgressStoryIds = useMemo(() => {
    const ids = new Set<number>();

    // Защита от случаев, когда по ошибке в состоянии окажется не массив
    const list: UserPlaythrough[] = Array.isArray(userPlaythroughs)
      ? userPlaythroughs
      : [];

    list.forEach((p) => {
      if (!p.isCompleted) {
        ids.add(p.story.id);
      }
    });

    return ids;
  }, [userPlaythroughs]);

  // Получаем ID популярных историй для проверки
  const popularStoryIds = useMemo(
    () => new Set(popularStories.map((s) => s.id)),
    [popularStories]
  );

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

          {/* Секция Популярное */}
          {popularStories.length > 0 && (
            <section className="popular-stories-section">
              <h2 className="section-title">
                <span className="title-icon title-icon-cosmic" aria-hidden />
                Популярное
              </h2>
              <div className="stories-grid">
                {popularStories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    user={user}
                    ratingInfo={storyRatings[story.id]}
                    isPopular={true}
                    showPopularBadge={true}
                    // если по этой истории есть незавершённое прохождение — показываем закладку
                    isInProgress={inProgressStoryIds.has(story.id)}
                    onPlay={handlePlay}
                    onDetails={handleDetails}
                    onSignIn={goToSignIn}
                    onRatingChange={handleRatingChange}
                  />
                ))}
              </div>
            </section>
          )}

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
                    ratingInfo={storyRatings[story.id]}
                    isPopular={popularStoryIds.has(story.id)}
                    showPopularBadge={false}
                    // если по этой истории есть незавершённое прохождение — показываем закладку
                    isInProgress={inProgressStoryIds.has(story.id)}
                    onPlay={handlePlay}
                    onDetails={handleDetails}
                    onSignIn={goToSignIn}
                    onRatingChange={handleRatingChange}
                  />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Footer */}
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
