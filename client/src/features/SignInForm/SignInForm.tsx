import { useState } from "react";
import { useNavigate } from "react-router";
import "./SignInForm.css";
import type { ChangeEvent, FormEvent } from "react";
import { useAppDispatch } from "../../shared/hooks/reduxHooks";
import { signinThunk } from "../../entities/user/api/UserApi";
import { CLIENT_ROUTES } from "../../shared/enam/clientRouter";

const INITIAL_INPUTS_DATA = {
  email: "",
  password: "",
};

export default function SignInForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [inputs, setInputs] = useState(INITIAL_INPUTS_DATA);

  const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    setInputs((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  function loginUserHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    dispatch(signinThunk(inputs))
      .unwrap()
      .then(() => {
        navigate(CLIENT_ROUTES.ALLSTORIES);
      })
      .catch((error) => {
        alert(error || "Login failed");
      });
  }

  return (
    <>
      <div className="login-container">
        <div className="cosmic-bg" aria-hidden />
        <div className="login-card">
          <h2 className="login-title">Войти в аккаунт</h2>
          <form onSubmit={loginUserHandler}>
            <input
              name="email"
              type="email"
              value={inputs.email}
              onChange={onChangeHandler}
              placeholder="Email"
              className="login-input input-base"
              required
            />
            <input
              name="password"
              type="password"
              value={inputs.password}
              onChange={onChangeHandler}
              placeholder="Password"
              className="login-input input-base"
              required
            />
            <button
              type="submit"
              disabled={!inputs.email || !inputs.password}
              className="login-button"
            >
              Войти
            </button>
          </form>
        </div>
      </div>

      <footer className="main-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Интерактивные новеллы</h4>
              <p>
                Платформа для создания и чтения интерактивных историй нового
                поколения.
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              &copy; 2026 Интерактивные новеллы. Создано с ❤️ для любителей
              хороших историй.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
