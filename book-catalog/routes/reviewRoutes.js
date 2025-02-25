const express = require("express");
const Review = require("../models/Review");
const Book = require("../models/Book"); // Добавляем импорт
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// 📌 Получить отзывы для книги
router.get("/:bookId", async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId }).populate(
      "user",
      "username"
    ); // Исправлено с "userId" на "user"
    res.json(reviews);
  } catch (err) {
    console.error("Ошибка загрузки отзывов:", err.message);
    res.status(500).json({ message: "Ошибка загрузки отзывов" });
  }
});

// ➕ Добавить новый отзыв (ТОЛЬКО АВТОРИЗОВАННЫЕ)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { book, rating, comment } = req.body;
    const user = req.user.userId; // Получаем ID пользователя из токена

    // Проверяем, существует ли книга
    const bookExists = await Book.findById(book);
    if (!bookExists) {
      return res.status(404).json({ message: "Книга не найдена" });
    }

    // Проверяем, оставлял ли пользователь уже отзыв
    const existingReview = await Review.findOne({ book, user });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "Вы уже оставили отзыв на эту книгу" });
    }

    // Создаем новый отзыв
    const newReview = new Review({ book, user, rating, comment });
    await newReview.save();

    res.status(201).json(newReview);
  } catch (err) {
    console.error("Ошибка добавления отзыва:", err.message);
    res.status(500).json({ message: "Ошибка при добавлении отзыва" });
  }
});

// ✏️ Обновить отзыв (ТОЛЬКО ВЛАДЕЛЕЦ)
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) return res.status(404).json({ message: "Отзыв не найден" });

    if (review.user.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Вы не можете редактировать этот отзыв" });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();

    res.json(review);
  } catch (err) {
    console.error("Ошибка обновления отзыва:", err.message);
    res.status(500).json({ message: "Ошибка обновления отзыва" });
  }
});

// ❌ Удалить отзыв (ТОЛЬКО ВЛАДЕЛЕЦ или АДМИН)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Отзыв не найден" });

    if (
      review.user.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "У вас нет прав на удаление этого отзыва" });
    }

    await review.deleteOne();
    res.json({ message: "Отзыв удален" });
  } catch (err) {
    console.error("Ошибка удаления отзыва:", err.message);
    res.status(500).json({ message: "Ошибка при удалении отзыва" });
  }
});

module.exports = router;
