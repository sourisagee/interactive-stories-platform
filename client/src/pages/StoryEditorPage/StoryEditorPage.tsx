import React, { useEffect } from "react";
import { useParams } from "react-router";
import { useStoryEditorActions } from "../../shared/hooks/storyEditorHooks";
import StoryEditor from "../../features/StoryEditor/StoryEditor";
import { useStoryEditorState } from "../../shared/hooks/storyEditorHooks";
import "./StoryEditorPage.css";

const StoryEditorPage: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const actions = useStoryEditorActions();
  const { isLoading, error, currentStory } = useStoryEditorState();

  useEffect(() => {
    if (storyId) {
      actions.getFullStory(Number(storyId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId]);

  if (isLoading) {
    return (
      <div className="story-editor-page">
        <div className="story-editor-loading" style={{ padding: "2rem", textAlign: "center" }}>
          Загрузка истории...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="story-editor-page">
        <div className="story-editor-error" style={{ padding: "2rem", textAlign: "center" }}>
          {error}
        </div>
      </div>
    );
  }

  if (!currentStory) {
    return (
      <div className="story-editor-page">
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-purple-mid)" }}>
          История не найдена или нет доступа
        </div>
      </div>
    );
  }

  return (
    <div className="story-editor-page">
      <header className="story-editor-page-header">
        <h1 className="story-editor-page-title">
          Редактор: {currentStory.title}
        </h1>
        <p className="story-editor-page-meta">
          ID истории: {storyId} · Автор: {currentStory.authorName}
        </p>
      </header>

      <div className="story-editor-wrapper">
        <StoryEditor />
      </div>
    </div>
  );
};

export default StoryEditorPage;
