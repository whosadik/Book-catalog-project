import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import "../styles/globals.css"; // Импортируем стили

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ошибка входа");
      }

      console.log("✅ Успешный вход:", data); // Проверяем ответ

      // ✅ Сохраняем токен и роль пользователя
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("role", data.user.role);

      console.log("🔹 Сохраненные данные:", {
        token: localStorage.getItem("token"),
        role: localStorage.getItem("role"),
      });

      // ✅ Принудительно обновляем Navbar
      window.dispatchEvent(new Event("storage"));

      // ✅ Перенаправляем пользователя на профиль
      router.push("/profile");
    } catch (err) {
      console.error("❌ Ошибка входа:", err.message);
      setError(err.message);
    }
  };

  return (
    <div class="login">
      <h2>Вход в аккаунт</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Войти</button>
      </form>

      <p>
        Нет аккаунта? <Link href="/signup">Зарегистрируйтесь</Link>
      </p>
    </div>
  );
}
