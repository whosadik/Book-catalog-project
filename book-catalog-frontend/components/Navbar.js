import Link from "next/link";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useEffect, useState } from "react";
import "../styles/globals.css"; // Импортируем стили

export default function Navbar() {
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("role");
      const token = localStorage.getItem("token");
      setRole(storedRole);
      setIsAuthenticated(!!token);
    }
  }, []);
  const goToRandomBook = async () => {
    const res = await fetch("http://localhost:5000/api/books/random");
    const book = await res.json();
    if (book._id) {
      router.push(`/books/${book._id}`);
    } else {
      alert("Книг нет в базе");
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Book Catalog
        </Typography>

        <Button color="inherit" component={Link} href="/">
          🏠 Главная
        </Button>
        <Button color="inherit" component={Link} href="/books">
          📚 Книги
        </Button>
        <Button color="inherit" component={Link} href="/favorites">
          ❤️ Избранное
        </Button>
        {isAuthenticated && (
          <Button color="inherit" component={Link} href="/profile">
            👤 Профиль
          </Button>
        )}
        {/* 🔥 Кнопка "Случайная книга" */}

        <Button color="inherit" component={Link} href="/random-book">
          🎲 Случайная книга
        </Button>

        {/* 🔹 Кнопка "Добавить книгу" только для админа */}
        {role === "admin" && (
          <>
            <Button color="inherit" component={Link} href="/admin/add-book">
              ➕ Добавить книгу
            </Button>
            <Button color="inherit" component={Link} href="/admin/stats">
              📊 Статистика
            </Button>
          </>
        )}

        {/* 🔹 Показываем Войти/Выйти в зависимости от авторизации */}
        {isAuthenticated ? (
          <Button
            color="inherit"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              localStorage.removeItem("role");
              setRole(null);
              setIsAuthenticated(false);
              window.location.reload(); // 🔄 Обновляем страницу
            }}
          >
            🚪 Выйти
          </Button>
        ) : (
          <Button color="inherit" component={Link} href="/login">
            🔑 Войти
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
