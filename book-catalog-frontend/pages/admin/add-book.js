import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { addBook } from "../../utils/api";

export default function AddBookPage() {
  const [book, setBook] = useState({
    title: "",
    author: "",
    genres: "",
    year: "",
    rating: "",
  });

  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    }
  }, []);

  const handleChange = (e) => {
    setBook({ ...book, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role !== "admin") {
      alert("У вас нет прав для добавления книг!");
      return;
    }

    try {
      await addBook(book, token);
      alert("Книга добавлена!");
      router.push("/books"); // Перенаправляем на список книг
    } catch (err) {
      alert("Ошибка при добавлении книги: " + err.message);
    }
  };

  return (
    <div class="add-book">
      <h2>Добавить новую книгу</h2>
      {role !== "admin" && <p style={{ color: "red" }}>❌ Доступ запрещен!</p>}
      <form onSubmit={handleSubmit} class="add-book-form">
        <input
          type="text"
          name="title"
          placeholder="Название"
          value={book.title}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="author"
          placeholder="Автор"
          value={book.author}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="genres"
          placeholder="Жанры (через запятую)"
          value={book.genres}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="year"
          placeholder="Год издания"
          value={book.year}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="rating"
          placeholder="Рейтинг (1-5)"
          min="1"
          max="5"
          step="0.1"
          value={book.rating}
          onChange={handleChange}
          required
        />
        <button type="submit">➕ Добавить книгу</button>
      </form>
    </div>
  );
}
