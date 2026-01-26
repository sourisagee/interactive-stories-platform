import React from "react";
import { useAppSelector } from "../../shared/hooks/reduxHooks";
import { UserRole, type UserData } from "../../entities/user/model";

export default function ProfilePage() {
  const { user, isLoading } = useAppSelector((state) => state.user);

  
  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    return <div>Пользователь не найден</div>;
  }

  return (
    <div className="profile">
      <div className="date">
        <h2>Профиль</h2>
        <p>ID: {user.id}</p>
        <p>Email: {user.email}</p>
        <p>Роль: {user.role === UserRole.AUTHOR ? "Автор" : "Игрок"}</p>
        <p>Имя: {user.username}</p>
      </div>

      <div className="statistics">
        {user.role === UserRole.AUTHOR ? (
          <div>
            <h3>Статистика автора</h3>
            <p>Мои истории</p>
          </div>
        ) : (
          <div>
            <h3>Статистика игрока</h3>
            <p>Мои прохождения</p>
          </div>
        )}
      </div>
    </div>
  );
}