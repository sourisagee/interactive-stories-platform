import { NavLink } from "react-router";
import "./Nav.css";
import { useAppSelector } from "../../shared/hooks/reduxHooks";
import { CLIENT_ROUTES } from "../../shared/enam/clientRouter";

export default function Nav() {
  const user = useAppSelector((state) => state.user.user);
  const isLoggedIn = !!user;

  return (
    <>
      <nav className="nav">
        {/* Главная - всегда видна */}
        <NavLink to={CLIENT_ROUTES.HOME} className="nav-link">
          Главная
        </NavLink>

        {/* Авторизация: Выход или Вход/Регистрация */}
        {isLoggedIn ? (
          <>
            {/* Для зарегистрированного пользователя */}

            <NavLink to={CLIENT_ROUTES.SIGN_OUT} className="nav-link">
              Выход
            </NavLink>
            <NavLink to={CLIENT_ROUTES.PROFILE} className="nav-link">
              Профиль
            </NavLink>
          </>
        ) : (
          <>
            {/* Для незарегистрированного пользователя */}
            <NavLink to={CLIENT_ROUTES.SIGN_UP} className="nav-link">
              Регистрация
            </NavLink>
            <NavLink to={CLIENT_ROUTES.SIGN_IN} className="nav-link">
              Вход
            </NavLink>
          </>
        )}
      </nav>
    </>
  );
}
