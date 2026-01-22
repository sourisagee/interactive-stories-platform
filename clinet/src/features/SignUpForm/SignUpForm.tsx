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
        navigate(CLIENT_ROUTES.HOME);
      })
      .catch((error) => {
        alert(error || "Registration failed");
      });
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Создать аккаунт</h2>

        <form onSubmit={registrationUserHandler}>
          <input
            onChange={onChangeHandler}
            name="username"
            type="text"
            value={inputs.username}
            placeholder="Ваше имя"
            className="register-input"
            required
          />

          <input
            onChange={onChangeHandler}
            name="email"
            type="email"
            value={inputs.email}
            placeholder="Email"
            className="register-input"
            required
          />

          <input
            onChange={onChangeHandler}
            name="password"
            type="password"
            value={inputs.password}
            placeholder="Пароль"
            className="register-input"
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
            className="register-input"
            required
          >
            <option value={UserRole.USER}>Пользователь</option>
            <option value={UserRole.AUTHOR}>Автор</option>
          </select>

          <button type="submit" className="register-button">
            Зарегистрироваться
          </button>
        </form>
      </div>
    </div>
  );
}