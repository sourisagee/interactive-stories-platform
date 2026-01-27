import { NavLink } from "react-router";
import "./Nav.css";
import { useAppSelector } from "../../shared/hooks/reduxHooks";
import { CLIENT_ROUTES } from "../../shared/enam/clientRouter";
import { editStoryPath } from "../../shared/enam/clientRouter";

export default function Nav() {
  const user = useAppSelector((state) => state.user.user);
  const isLoggedIn = !!user;
  const isAuthor = user?.role === "AUTHOR";

  return (
    <nav className="nav">
      <div className="nav-left">
        {isLoggedIn ? (
          <>
            <NavLink to={CLIENT_ROUTES.HOME} className="nav-link">
              Главная
            </NavLink>
            <NavLink to={CLIENT_ROUTES.ALLSTORIES} className="nav-link">
              Все истории
            </NavLink>
            <NavLink to={CLIENT_ROUTES.PROFILE} className="nav-link">
              Профиль
            </NavLink>
          </>
        ) : (
          <NavLink to={CLIENT_ROUTES.HOME} className="nav-link">
            Главная
          </NavLink>
        )}

        {isLoggedIn && isAuthor && (
          <NavLink to={editStoryPath(0)} className="nav-link">
            Панель редактора 
          </NavLink>
        )}
      </div>
      <div className="nav-right">
        {isLoggedIn ? (
          <NavLink to={CLIENT_ROUTES.SIGN_OUT} className="nav-link">
            Выход
          </NavLink>
        ) : (
          <>
            <NavLink to={CLIENT_ROUTES.SIGN_IN} className="nav-link">
              Вход
            </NavLink>
            <NavLink to={CLIENT_ROUTES.SIGN_UP} className="nav-link">
              Регистрация
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
