import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../shared/hooks/reduxHooks";
import { getStoryByIdThunk } from "../../entities/story/api/StoryApi";
import { getCoverImageSrc } from "../../shared/lib/getServerBaseUrl";
import { CLIENT_ROUTES } from "../../shared/enam/clientRouter";
import "./StoryDetailPage.css";

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentStory, isLoading, error } = useAppSelector((s) => s.stories);

  const numId = id ? Number(id) : NaN;
  const validId = !Number.isNaN(numId) && numId > 0;

  useEffect(() => {
    if (validId) dispatch(getStoryByIdThunk(numId));
  }, [validId, numId, dispatch]);

  if (!validId) {
    return (
      <div className="story-detail-page">
        <div className="story-detail-error">История не найдена</div>
        <button type="button" className="btn btn-primary story-detail-back" onClick={() => navigate(CLIENT_ROUTES.ALLSTORIES)}>
          К списку
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="story-detail-page">
        <div className="story-detail-loading">Загрузка...</div>
      </div>
    );
  }

  if (error || !currentStory) {
    return (
      <div className="story-detail-page">
        <div className="story-detail-error">{error || "История не найдена"}</div>
        <button type="button" className="btn btn-primary story-detail-back" onClick={() => navigate(CLIENT_ROUTES.ALLSTORIES)}>
          К списку
        </button>
      </div>
    );
  }

  return (
    <div className="story-detail-page">
      <div className="story-detail-card">
        <div className="story-detail-cover">
          <img src={getCoverImageSrc(currentStory.cover)} alt={currentStory.title} />
        </div>
        <div className="story-detail-body">
          <h1 className="story-detail-title">{currentStory.title}</h1>
          <p className="story-detail-meta">Автор: {currentStory.authorName} · {currentStory.genre}</p>
          <p className="story-detail-desc">{currentStory.description}</p>
          <button type="button" className="btn btn-primary story-detail-back" onClick={() => navigate(CLIENT_ROUTES.ALLSTORIES)}>
            К списку
          </button>
        </div>
      </div>
    </div>
  );
}
