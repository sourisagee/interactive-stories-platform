import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import Nav from "../widgets/nav/Nav";
import SignUpPage from "../pages/SignUpPage/SignUpPage";
import SignInPage from "../pages/SignInPage/SignInPage";
import SignOutPage from "../pages/SignOutPage/SignOutPage";
import MainPage from "../pages/MainPage/MainPage";
import { useAppDispatch } from "../shared/hooks/reduxHooks";
import { refreshThunk } from "../entities/user/api/UserApi";
import { CLIENT_ROUTES } from "../shared/enam/clientRouter";
import ProfilePage from "@/pages/ProfilePage/ProfilePage"

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(refreshThunk());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path={CLIENT_ROUTES.HOME} element={<MainPage />} />
        <Route path={CLIENT_ROUTES.SIGN_UP} element={<SignUpPage />} />
        <Route path={CLIENT_ROUTES.SIGN_IN} element={<SignInPage />} />
        <Route path={CLIENT_ROUTES.SIGN_OUT} element={<SignOutPage />} />
        <Route path={CLIENT_ROUTES.PROFILE} element ={<ProfilePage/>}/>
      </Routes>
    </BrowserRouter>
  );
}
