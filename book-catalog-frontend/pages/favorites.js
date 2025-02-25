import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFavorites, removeFromFavorites } from "../utils/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import "../styles/globals.css"; // ✅ Подключаем стили

export default function FavoritesPage() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(null);

  // 🔹 Загружаем токен ТОЛЬКО на клиенте
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  const {
    data: favorites,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => fetchFavorites(token),
    enabled: !!token, // 🔹 Делаем запрос ТОЛЬКО если есть токен
  });

  useEffect(() => {
    console.log("🎯 Избранные книги:", favorites);
  }, [favorites]);

  const removeMutation = useMutation({
    mutationFn: (bookId) => removeFromFavorites(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries(["favorites"]);
    },
  });

  if (isLoading) return <p>Загрузка избранного...</p>;
  if (error) return <p>Ошибка загрузки</p>;

  // 🔹 Фильтруем книги, у которых `book` не `null`
  const validFavorites = favorites?.filter((fav) => fav.book !== null) || [];

  return (
    <div class="favorites">
      <h2>Избранные книги</h2>
      {validFavorites.length === 0 ? (
        <p>Нет избранных книг.</p>
      ) : (
        validFavorites.map((fav) => (
          <div key={fav._id} class="favbook">
            <p>
              <strong>{fav.book.title}</strong> – {fav.book.author}
            </p>
            <Link href={`/books/${fav.book._id}`}>Подробнее</Link>
            <button onClick={() => removeMutation.mutate(fav.book._id)}>
              💔 Удалить
            </button>
          </div>
        ))
      )}
    </div>
  );
}
