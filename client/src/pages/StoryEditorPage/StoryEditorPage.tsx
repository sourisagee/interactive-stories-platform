import React, { useEffect } from "react";
import { useParams } from "react-router";
// import { useAppDispatch } from "../../shared/hooks/reduxHooks";
import { useStoryEditorActions } from "../../shared/hooks/storyEditorHooks";
import StoryEditor from "../../features/StoryEditor/StoryEditor";
import { useStoryEditorState } from "../../shared/hooks/storyEditorHooks";
import {
  setCurrentStory,
  resetEditor,
} from "@/entities/story/slice/storyEditorSlice";

const StoryEditorPage: React.FC = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const actions = useStoryEditorActions();

  const { isLoading, error, currentStory } = useStoryEditorState();

  setCurrentStory(currentStory);

  useEffect(() => {
    if (storyId) {
      // Загружаем историю при монтировании
      actions.getFullStory(Number(storyId));
    } 
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* <Loader size="lg" text="Загрузка истории..." /> */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* <Alert 
          variant="error" 
          title="Ошибка загрузки"
          message={error}
        /> */}
      </div>
    );
  }

  if (!currentStory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* <Alert 
          variant="warning" 
          title="История не найдена"
          message="Запрашиваемая история не существует или у вас нет к ней доступа"
        /> */}
        <p>Привет</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Редактор: {currentStory.title}
          </h1>
          <p className="text-gray-600 mt-2">
            ID истории: {storyId} | Автор: {currentStory.authorName}
          </p>
        </div>

        <StoryEditor />
      </div>
    </div>
  );
};

export default StoryEditorPage;
