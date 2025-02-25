import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchProfile, updateProfile } from "../utils/api";
import "../styles/globals.css"; // ✅ Подключаем стили

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false); // Флаг редактирования
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchProfile(token)
      .then((data) => {
        setUser(data);
        setUsername(data.username);
        setEmail(data.email);
      })
      .catch((err) => console.error("Ошибка загрузки профиля:", err));
  }, [router]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const data = await updateProfile({ username, email, password }, token);
      setMessage(data.message);
      setIsEditing(false); // Закрываем форму после обновления
    } catch (err) {
      console.error("Ошибка обновления:", err);
      setMessage("Ошибка обновления профиля");
    }
  };

  if (!user) return <p>Загрузка профиля...</p>;

  return (
    <div class="profile">
      <h2>Профиль пользователя</h2>
      {message && <p>{message}</p>}

      {/* 🔹 Информация о профиле */}
      {!isEditing ? (
        <div>
          <p>
            <strong>Имя пользователя:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <button onClick={() => setIsEditing(true)}>
            ✏️ Изменить профиль
          </button>
        </div>
      ) : (
        // 🔹 Форма редактирования профиля
        <form onSubmit={handleUpdate}>
          <label>
            Имя пользователя:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Новый пароль (необязательно):
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit">💾 Сохранить</button>
          <button type="button" onClick={() => setIsEditing(false)}>
            ❌ Отмена
          </button>
        </form>
      )}
    </div>
  );
}
