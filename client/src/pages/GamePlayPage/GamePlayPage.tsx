import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../shared/hooks/reduxHooks";
import { getStoryFullThunk } from "../../entities/story/api/StoryApi";
import type { StoryFullData } from "../../entities/story/model";
import { CLIENT_ROUTES } from "../../shared/enam/clientRouter";
import SceneBackground from "./SceneBackground";
import "./GamePlayPage.css";

// Страница игры
export default function GamePlayPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentStory, isLoading, error } = useAppSelector((s) => s.stories);
  const [currentNodeId, setCurrentNodeId] = useState<number | null>(null); // Текущий узел

  const fullStory = currentStory as StoryFullData | null;
  const nodes = fullStory?.nodes ?? [];

  const startNode = useMemo(
    // Поиск стартового узла
    () => nodes.find((n) => n.isStart) ?? null,
    [nodes]
  );

  const numStoryId = storyId ? Number(storyId) : NaN;
  const validStoryId = !Number.isNaN(numStoryId) && numStoryId > 0;

  useEffect(() => {
    // Загружает полную историю с узлами через Redux
    if (validStoryId) dispatch(getStoryFullThunk(numStoryId));
  }, [validStoryId, numStoryId, dispatch]);

  useEffect(() => {
    setCurrentNodeId(null);
  }, [storyId]);

  useEffect(() => {
    if (!startNode || !fullStory) return;
    const valid = nodes.some((n) => n.id === currentNodeId);
    if (currentNodeId === null || !valid) setCurrentNodeId(startNode.id);
  }, [startNode, fullStory, nodes, currentNodeId]);

  const currentNode = useMemo(() => {
    const n = nodes.find((nd) => nd.id === currentNodeId);
    if (n) return n;
    if (startNode && currentNodeId === null) return startNode;
    return null;
  }, [nodes, currentNodeId, startNode]);

  const handleChoice = (toNodeId: number) => setCurrentNodeId(toNodeId);
  const handleRestart = () => startNode && setCurrentNodeId(startNode.id);

  if (!validStoryId) {
    return (
      <div className="game-play-page game-play-fallback">
        <div className="game-play-message">
          <p className="game-play-error">История не найдена</p>
          <button
            className="game-play-btn"
            onClick={() => navigate(CLIENT_ROUTES.ALLSTORIES)}
          >
            К списку
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="game-play-page game-play-fallback">
        <div className="game-play-message">
          <p className="game-play-loading">Загрузка игры...</p>
        </div>
      </div>
    );
  }

  if (error || !fullStory) {
    return (
      <div className="game-play-page game-play-fallback">
        <div className="game-play-message">
          <p className="game-play-error">{error || "История не найдена"}</p>
          <button
            className="game-play-btn"
            onClick={() => navigate(CLIENT_ROUTES.ALLSTORIES)}
          >
            К списку
          </button>
        </div>
      </div>
    );
  }

  if (!startNode) {
    return (
      <div className="game-play-page game-play-fallback">
        <div className="game-play-message">
          <p className="game-play-error">Нет стартового узла</p>
          <button
            className="game-play-btn"
            onClick={() => navigate(CLIENT_ROUTES.ALLSTORIES)}
          >
            К списку
          </button>
        </div>
      </div>
    );
  }

  if (!currentNode) {
    return (
      <div className="game-play-page game-play-fallback">
        <div className="game-play-message">
          <p className="game-play-loading">Загрузка сцены...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-play-page game-play-viewport">
      <SceneBackground
        title={currentNode.title}
        content={currentNode.content}
      />
      <button
        className="game-play-exit"
        onClick={() => navigate(CLIENT_ROUTES.ALLSTORIES)}
        type="button"
      >
        Выйти
      </button>
      <div className="game-play-overlay">
        <h2 className="game-play-scene-title">{currentNode.title}</h2>
        <p className="game-play-scene-content">{currentNode.content}</p>
        {currentNode.isEnd ? (
          <div className="game-play-end">
            <p className="game-play-end-text">История завершена.</p>
            <button className="game-play-btn" onClick={handleRestart}>
              Начать заново
            </button>
          </div>
        ) : (
          <div className="game-play-choices">
            {currentNode.fromChoices.map((c) => (
              <button
                key={c.id}
                className="game-play-choice"
                onClick={() => handleChoice(c.toNodeId)}
                type="button"
              >
                {c.choiceText}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
