import { useState } from "react";
import { useNavigate } from "react-router";
import "./SignUpForm.css";
import type { ChangeEvent, FormEvent } from "react";
import { useAppDispatch } from "../../shared/hooks/reduxHooks";
import { signupThunk } from "../../entities/user/api/UserApi";
import { UserRole } from "../../entities/user/model";
import { CLIENT_ROUTES } from "../../shared/enam/clientRouter";

const INITIAL_INPUTS_DATA = {
  username: "",
  email: "",
  password: "",
  role: UserRole.USER,
};

export default function SignUpForm() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [inputs, setInputs] = useState(INITIAL_INPUTS_DATA);
  const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    setInputs((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  function registrationUserHandler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    dispatch(signupThunk(inputs))
      .unwrap()
      .then(() => {
        navigate(CLIENT_ROUTES.ALLSTORIES);
      })
      .catch((error) => {
        alert(error || "Registration failed");
      });
  }

  return (
    <>
      <div className="register-container">
        <div className="cosmic-bg" aria-hidden />
        <div className="register-card">
          <h2 className="register-title">Создать аккаунт</h2>

          <form onSubmit={registrationUserHandler}>
            <input
              onChange={onChangeHandler}
              name="username"
              type="text"
              value={inputs.username}
              placeholder="Name"
              className="register-input input-base"
              required
            />
            <input
              onChange={onChangeHandler}
              name="email"
              type="email"
              value={inputs.email}
              placeholder="Email"
              className="register-input input-base"
              required
            />
            <input
              onChange={onChangeHandler}
              name="password"
              type="password"
              value={inputs.password}
              placeholder="Password"
              className="register-input input-base"
              required
            />
            <select
              onChange={(e) => {
                setInputs((prevState) => ({
                  ...prevState,
                  role: e.target.value as UserRole,
                }));
              }}
              value={inputs.role}
              className="register-input input-base"
              required
            >
              <option value={UserRole.USER}>Игрок</option>
              <option value={UserRole.AUTHOR}>Автор</option>
            </select>
            <button type="submit" className="register-button">
              Зарегистрироваться
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