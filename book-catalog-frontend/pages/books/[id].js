import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchBookById,
  updateBook,
  deleteBook,
  addToFavorites,
  removeFromFavorites,
  fetchFavorites,
  fetchReviews,
  addReview,
  fetchFilteredBooks,
} from "../../utils/api";
import { useState, useEffect } from "react";
import "../../styles/globals.css"; // ✅ Подключаем стили

export default function BookDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const role =
    typeof window !== "undefined" ? localStorage.getItem("role") : null; // Получаем роль пользователя

  // 🔹 Запрос книги

  const {
    data: book,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["book", id],
    queryFn: () => fetchBookById(id),
    enabled: !!id,
  });

  // 🔹 Запрос отзывов
  const { data: reviews, refetch } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => fetchReviews(id),
    enabled: !!id,
  });

  // 🔹 Состояние формы отзыва
  const [newReview, setNewReview] = useState({ rating: "", comment: "" });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (!token) {
        throw new Error("Вы не авторизованы!");
      }
      console.log("📩 Отправка отзыва...", { id, ...newReview });

      return addReview(id, newReview.rating, newReview.comment, token);
    },
    onSuccess: () => {
      console.log("✅ Отзыв успешно добавлен!");
      setNewReview({ rating: "", comment: "" }); // Очищаем форму
      refetch(); // Перезагружаем отзывы
    },
    onError: (error) => {
      console.error("❌ Ошибка при отправке отзыва:", error.message);
      alert(error.message);
    },
  });

  // 🔹 Проверка, находится ли книга в избранном
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFavorites = async () => {
      if (!token) return;

      try {
        const favorites = await fetchFavorites(token);
        setIsFavorite(favorites.some((fav) => fav._id === id));
      } catch (err) {
        console.error("❌ Ошибка загрузки избранного:", err);
      }
    };

    checkFavorites();
  }, [id, token]);

  // 🔹 Форма добавления отзыва

  const handleAddReview = () => {
    if (!token) return alert("Вы не авторизованы!");
    reviewMutation.mutate(newReview);
  };

  // 🔹 Мутация для добавления в избранное
  const addMutation = useMutation({
    mutationFn: () => addToFavorites(id, token),
    onSuccess: () => {
      alert("Книга добавлена в избранное!");
      setIsFavorite(true);
      queryClient.invalidateQueries(["favorites"]);
    },
  });

  // 🔹 Мутация для удаления из избранного
  const removeMutation = useMutation({
    mutationFn: () => removeFromFavorites(id, token),
    onSuccess: () => {
      alert("Книга удалена из избранного!");
      setIsFavorite(false);
    },
  });

  // 🔹 Мутация для обновления книги (только для админов)
  const updateMutation = useMutation({
    mutationFn: ({ id, data, token }) => updateBook(id, data, token),
    onSuccess: () => {
      alert("Книга обновлена!");
      queryClient.invalidateQueries(["book", id]);
      setEditing(false);
    },
  });

  // 🔹 Мутация для удаления книги (только для админов)
  const deleteMutation = useMutation({
    mutationFn: ({ id, token }) => deleteBook(id, token),
    onSuccess: () => {
      alert("Книга удалена!");
      router.push("/books");
    },
  });

  // 🔹 Функция обновления книги
  const [editing, setEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState({
    title: "",
    author: "",
    description: "",
  });

  useEffect(() => {
    if (book) {
      setUpdatedData({
        title: book.title || "",
        author: book.author || "",
        description: book.description || "",
      });
    }
  }, [book]);

  const handleUpdate = () => {
    if (!token) return alert("Вы не авторизованы!");
    updateMutation.mutate({ id, data: updatedData, token });
  };

  const handleDelete = () => {
    if (!token) return alert("Вы не авторизованы!");
    if (confirm("Удалить эту книгу?")) {
      deleteMutation.mutate({ id, token });
    }
  };

  // 🔹 Функции добавления/удаления из избранного
  const handleAddToFavorites = () => {
    if (!token) return alert("Вы не авторизованы!");
    addMutation.mutate();
  };

  const handleRemoveFromFavorites = () => {
    if (!token) return alert("Вы не авторизованы!");
    removeMutation.mutate();
  };

  // ✅ Проверка, загружены ли данные
  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка загрузки книги</p>;
  if (!book) return <p>Книга не найдена</p>;

  return (
    <div class="bookpage">
      <h1>{book.title}</h1>
      <p>{book.author}</p>
      <p>{book.description}</p>

      {/* 🔹 Кнопки управления книгой (только для админов) */}
      {role === "admin" && (
        <div>
          {editing ? (
            <div>
              <input
                type="text"
                placeholder="Название"
                value={updatedData.title}
                onChange={(e) =>
                  setUpdatedData({ ...updatedData, title: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Автор"
                value={updatedData.author}
                onChange={(e) =>
                  setUpdatedData({ ...updatedData, author: e.target.value })
                }
              />
              <textarea
                placeholder="Описание"
                value={updatedData.description}
                onChange={(e) =>
                  setUpdatedData({
                    ...updatedData,
                    description: e.target.value,
                  })
                }
              ></textarea>
              <button onClick={handleUpdate}>💾 Сохранить</button>
              <button onClick={() => setEditing(false)}>❌ Отмена</button>
            </div>
          ) : (
            <div>
              <button onClick={() => setEditing(true)}>✏️ Редактировать</button>
              <button onClick={handleDelete}>🗑 Удалить</button>
            </div>
          )}
        </div>
      )}

      {/* 🔹 Кнопки избранного */}
      {isFavorite ? (
        <button onClick={handleRemoveFromFavorites}>
          💔 Удалить из избранного
        </button>
      ) : (
        <button onClick={handleAddToFavorites}>❤️ Добавить в избранное</button>
      )}

      {/* 🔹 Отзывы */}
      <h2>Отзывы</h2>
      {Array.isArray(reviews) && reviews.length > 0 ? (
        reviews.map((r) => (
          <div key={r._id}>
            <p>
              <strong>{r.user?.username || "Аноним"}:</strong> {r.comment} ⭐
              {r.rating}
            </p>
          </div>
        ))
      ) : (
        <p>Отзывов пока нет</p>
      )}

      {/* 🔹 Форма добавления отзыва */}
      <h3>Добавить отзыв</h3>
      <div class="inputs">
        <input
          class="rating"
          type="number"
          min="1"
          max="5"
          placeholder="Оценка"
          value={newReview.rating}
          onChange={(e) =>
            setNewReview({ ...newReview, rating: parseInt(e.target.value) })
          }
        />
        <input
          class="comment"
          type="text"
          placeholder="Комментарий"
          value={newReview.comment}
          onChange={(e) =>
            setNewReview({ ...newReview, comment: e.target.value })
          }
        />
      </div>
      <button onClick={() => reviewMutation.mutate()}>Отправить отзыв</button>
    </div>
  );
}
