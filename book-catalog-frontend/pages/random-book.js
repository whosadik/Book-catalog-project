import { useState } from "react";
import { useRouter } from "next/router";

export default function RandomBookPage() {
  const [book, setBook] = useState(null);
  const router = useRouter();

  const fetchRandomBook = async () => {
    const res = await fetch("http://localhost:5000/api/books/random");
    const data = await res.json();
    setBook(data);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>🎲 Случайная книга</h1>
      <button onClick={fetchRandomBook}>🔄 Показать случайную книгу</button>

      {book && (
        <div style={{ marginTop: "20px" }}>
          <h2>{book.title}</h2>
          <p>Автор: {book.author}</p>
          <p>Жанр: {book.genres?.join(", ") || "Нет жанра"}</p>
          <p>Год выпуска: {book.year}</p>
          <button onClick={() => router.push(`/books/${book._id}`)}>
            📖 Подробнее
          </button>
        </div>
      )}
    </div>
  );
}
