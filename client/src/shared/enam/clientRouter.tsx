export const CLIENT_ROUTES = {
  HOME: "/",
  PROFILE: "/profile",
  ALLSTORIES: "/allStories",
  SIGN_UP: "/signUp",
  SIGN_IN: "/signIn",
  SIGN_OUT: "/signOut",
  AI_ASSISTANT: "/ai",
};

/** Маршруты с :param — для кнопок играть и подробнее */
export const storyDetailPath = (id: number) => `/story/${id}`;
export const gamePlayPath = (storyId: number) => `/game/${storyId}`;
export const editStoryPath = (storyId: number) => `/story/edit/${storyId}`;
