import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import "./style.css";
import Nav from "../widgets/nav/Nav";
import SignUpPage from "../pages/SignUpPage/SignUpPage";
import SignInPage from "../pages/SignInPage/SignInPage";
import SignOutPage from "../pages/SignOutPage/SignOutPage";
import MainPage from "../pages/MainPage/MainPage";
import AllStoriesPage from "../pages/AllStoriesPage/AllStoriesPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import StoryDetailPage from "../pages/StoryDetailPage/StoryDetailPage";
import GamePlayPage from "../pages/GamePlayPage/GamePlayPage";
import StoryEditorPage from "@/pages/StoryEditorPage/StoryEditorPage";
import { useAppDispatch } from "../shared/hooks/reduxHooks";
import { refreshThunk } from "../entities/user/api/UserApi";
import { CLIENT_ROUTES } from "../shared/enam/clientRouter";

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(refreshThunk());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className="app-wrap">
        <Nav />
        <main className="app-main">
          <Routes>
            <Route path={CLIENT_ROUTES.HOME} element={<MainPage />} />
            <Route path={CLIENT_ROUTES.ALLSTORIES} element={<AllStoriesPage />} />
            <Route path="/story/:id" element={<StoryDetailPage />} />
            <Route path="/game/:storyId" element={<GamePlayPage />} />
            <Route path={CLIENT_ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path={CLIENT_ROUTES.SIGN_UP} element={<SignUpPage />} />
            <Route path={CLIENT_ROUTES.SIGN_IN} element={<SignInPage />} />
            <Route path={CLIENT_ROUTES.SIGN_OUT} element={<SignOutPage />} />
            <Route path='/story/edit/:storyId' element={<StoryEditorPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
