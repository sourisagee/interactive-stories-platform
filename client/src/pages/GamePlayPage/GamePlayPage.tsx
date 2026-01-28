import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../shared/hooks/reduxHooks";
import { getStoryFullThunk } from "../../entities/story/api/StoryApi";
import { playthroughApi } from "../../entities/story/api/PlaythroughApi";
import { UserRole } from "../../entities/user/model";
import type { StoryFullData } from "../../entities/story/model";
import { CLIENT_ROUTES } from "../../shared/enam/clientRouter";
import { getServerBaseUrl } from "../../shared/lib/getServerBaseUrl";
import GamePlayStats from "./GamePlayStats";
import "./GamePlayPage.css";

// Страница игры: для игрока прогресс сохраняется на сервере и восстанавливается при перезагрузке
export default function GamePlayPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentStory, isLoading, error } = useAppSelector((s) => s.stories);
  const { user } = useAppSelector((s) => s.user);
  const [currentNodeId, setCurrentNodeId] = useState<number | null>(null);
  const [playthroughId, setPlaythroughId] = useState<number | null>(null);
  const [restartKey, setRestartKey] = useState<number>(0);
  // Пока true — ждём загрузки/восстановления прохождения (только для игрока)
  const [playthroughInitLoading, setPlaythroughInitLoading] = useState(false);
  const [playthroughInitDone, setPlaythroughInitDone] = useState(false);

  const fullStory = currentStory as StoryFullData | null;
  const nodes = fullStory?.nodes ?? [];

  const startNode = useMemo(
    () => nodes.find((n) => n.isStart) ?? null,
    [nodes],
  );

  const numStoryId = storyId ? Number(storyId) : NaN;
  const validStoryId = !Number.isNaN(numStoryId) && numStoryId > 0;
  const isPlayer = user?.role === UserRole.USER;

  useEffect(() => {
    if (validStoryId) dispatch(getStoryFullThunk(numStoryId));
  }, [validStoryId, numStoryId, dispatch]);

  // При смене истории сбрасываем узел и прохождение
  useEffect(() => {
    setPlaythroughInitDone(false);
    setPlaythroughId(null);
    setCurrentNodeId(null);
    setRestartKey((prev) => prev + 1);
  }, [storyId]);

  // После загрузки истории: восстановить прохождение (игрок) или поставить стартовый узел (гость/автор)
  useEffect(() => {
    if (!fullStory || !startNode || !validStoryId) return;

    if (!isPlayer) {
      setCurrentNodeId(startNode.id);
      setPlaythroughInitDone(true);
      return;
    }

    let cancelled = false;
    setPlaythroughInitLoading(true);

    (async () => {
      try {
        const existing = await playthroughApi.getCurrentPlaythrough(numStoryId);
        if (cancelled) return;
        if (existing && !existing.isCompleted) {
          setPlaythroughId(existing.id);
          setCurrentNodeId(existing.currentNode.id);
        } else {
          const started = await playthroughApi.startPlaythrough(numStoryId);
          if (cancelled) return;
          setPlaythroughId(started.id);
          setCurrentNodeId(started.currentNode.id);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Ошибка инициализации прохождения", e);
          setCurrentNodeId(startNode.id);
        }
      } finally {
        if (!cancelled) {
          setPlaythroughInitLoading(false);
          setPlaythroughInitDone(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fullStory, startNode, validStoryId, numStoryId, isPlayer]);

  const currentNode = useMemo(() => {
    const n = nodes.find((nd) => nd.id === currentNodeId);
    if (n) return n;
    if (startNode && currentNodeId === null) return startNode;
    return null;
  }, [nodes, currentNodeId, startNode]);

  const handleChoice = async (choiceId: number, toNodeId: number) => {
    if (playthroughId !== null) {
      try {
        const next = await playthroughApi.makeChoice(playthroughId, choiceId);
        setCurrentNodeId(next.currentNode.id);
      } catch (e) {
        console.error("Ошибка выбора", e);
        setCurrentNodeId(toNodeId);
      }
    } else {
      setCurrentNodeId(toNodeId);
    }
  };

  const handleRestart = () => {
    if (startNode) {
      setCurrentNodeId(startNode.id);
      setRestartKey((prev) => prev + 1);
    }
  };

  if (!validStoryId) {
    return (
      <div className="game-play-page game-play-fallback">
        <div className="game-play-message">
          <p className="game-play-error">История не найдена</p>
          <button className="game-play-btn" onClick={() => navigate(CLIENT_ROUTES.ALLSTORIES)}>К списку</button>
        </div>
      </div>
    );
  }

  if (isLoading || (isPlayer && fullStory && !playthroughInitDone)) {
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
          <button className="game-play-btn" onClick={() => navigate(CLIENT_ROUTES.ALLSTORIES)}>К списку</button>
        </div>
      </div>
    );
  }

  if (!startNode) {
    return (
      <div className="game-play-page game-play-fallback">
        <div className="game-play-message">
          <p className="game-play-error">Нет стартового узла</p>
          <button className="game-play-btn" onClick={() => navigate(CLIENT_ROUTES.ALLSTORIES)}>К списку</button>
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

  const backgroundUrl =
    currentNode.picture && currentNode.picture.trim()
      ? `${getServerBaseUrl()}/backgrounds/${currentNode.picture}`
      : null;

  return (
    <div className="game-play-page game-play-viewport">
      {backgroundUrl && (
        <div
          className="game-play-background"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
          aria-hidden
        />
      )}
      <div className="game-play-overlay">
        <button
          className="game-play-exit"
          onClick={() => navigate(CLIENT_ROUTES.ALLSTORIES)}
          type="button"
        >
          Выйти
        </button>

        <div className="game-play-layout">
          <div className="game-play-sidebar">
            <GamePlayStats
              currentNode={currentNode}
              restartKey={restartKey}
            />
          </div>

          <div className="game-play-main">
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
                    onClick={() => handleChoice(c.id, c.toNodeId)}
                    type="button"
                  >
                    {c.choiceText}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
