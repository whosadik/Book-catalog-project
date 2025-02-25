import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
});

// 📌 Получить все книги
export const fetchBooks = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const response = await api.get(`/books?${queryParams}`);
  return response.data;
};

// 📌 Получить книгу по ID
export const fetchBookById = async (id) => {
  const response = await api.get(`/books/${id}`);
  return response.data;
};

// 📌 Войти в систему
export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

// 📌 Получить профиль пользователя
export const fetchProfile = async (token) => {
  try {
    const response = await api.get("/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Ошибка загрузки профиля:", error.response?.data || error);
    throw new Error("Ошибка загрузки профиля");
  }
};

// ✏️ Обновить профиль пользователя
export const updateProfile = async (userData, token) => {
  console.log("📩 Обновление профиля:", userData);

  try {
    const response = await api.put("/auth/profile", userData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error(
      "❌ Ошибка обновления профиля:",
      error.response?.data || error
    );
    throw new Error("Ошибка обновления профиля");
  }
};

// 📌 Обновить книгу
export async function updateBook(id, bookData, token) {
  console.log("🔹 Обновление книги:", id);
  console.log("🔹 Передаётся токен:", token); // Проверяем, есть ли токен

  try {
    const response = await api.patch(`/books/${id}`, bookData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при обновлении книги:", error);
    throw new Error("Ошибка при обновлении книги");
  }
}

// 📌 Удалить книгу
export async function deleteBook(id, token) {
  console.log("🔹 Удаление книги:", id);
  console.log("🔹 Передаётся токен:", token); // Проверяем, есть ли токен

  try {
    const response = await api.delete(`/books/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при удалении книги:", error);
    throw new Error("Ошибка при удалении книги");
  }
}

// 📌 Добавить в избранное
export const addToFavorites = async (bookId) => {
  const token = localStorage.getItem("token");

  if (!bookId) {
    console.error("⛔ Ошибка: bookId не указан!");
    throw new Error("Не передан bookId");
  }

  if (!token) {
    console.error("⛔ Ошибка: токен не указан!");
    throw new Error("Не передан токен");
  }

  console.log("🔹 Отправляем в избранное:", { bookId, token });

  try {
    const response = await api.post(
      "/favorites",
      { bookId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.message === "Книга уже в избранном") {
      console.warn("⚠️ Книга уже в избранном");
      return { success: false, message: "Книга уже в избранном" };
    }

    return { success: true, message: "Книга добавлена в избранное" };
  } catch (error) {
    console.error("❌ Ошибка добавления в избранное:", error.response.data);
    throw new Error("Ошибка добавления в избранное");
  }
};

// 📌 Удалить из избранного
// 📌 Удалить из избранного
export const removeFromFavorites = async (bookId) => {
  const token = localStorage.getItem("token");

  if (!token) throw new Error("⛔ Ошибка: токен не указан!");
  if (!bookId) throw new Error("⛔ Ошибка: bookId не указан!");

  console.log("🔹 Удаляем из избранного:", { bookId, token });

  try {
    const response = await api.delete(`/favorites/${bookId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error(
      "❌ Ошибка удаления из избранного:",
      error.response?.data || error
    );
    throw new Error("Ошибка удаления из избранного");
  }
};

// 📌 Получить избранные книги
export const fetchFavorites = async (token) => {
  if (!token) {
    console.error("⛔ Ошибка: токен не указан!");
    throw new Error("Не передан токен");
  }

  console.log("🔹 Загружаем избранное...");

  try {
    const response = await api.get("/favorites", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Ошибка загрузки избранного:", error.response.data);
    throw new Error("Ошибка загрузки избранного");
  }
};
// 📌 Получить все отзывы для книги
export const fetchReviews = async (id) => {
  const res = await fetch(`${API_URL}/reviews/${id}`);
  const data = await res.json();
  return Array.isArray(data) ? data : []; // ✅ Если нет данных, возвращаем []
};

// ➕ Добавить отзыв
export const addReview = async (bookId, rating, comment, token) => {
  console.log("📩 Отправляем отзыв:", { bookId, rating, comment });

  const res = await fetch("http://localhost:5000/api/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ book: bookId, rating, comment }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("❌ Ошибка при добавлении отзыва:", errorData);
    throw new Error(errorData.message || "Ошибка добавления отзыва");
  }

  return res.json();
};

export const fetchFilteredBooks = async (filters) => {
  const query = new URLSearchParams(filters).toString();
  const response = await fetch(
    `http://localhost:5000/api/books/filter?${query}`
  );
  if (!response.ok) throw new Error("Ошибка загрузки книг");
  return response.json();
};
export const addBook = async (book, token) => {
  const res = await fetch("http://localhost:5000/api/books/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Передаем токен
    },
    body: JSON.stringify(book),
  });

  if (!res.ok) throw new Error("Ошибка добавления книги");
  return res.json();
};
