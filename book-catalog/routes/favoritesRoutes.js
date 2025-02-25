const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const Favorite = require("../models/Favorite");

const router = express.Router();

// 📌 Получить избранные книги пользователя
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ Используем правильный userId
    const favorites = await Favorite.find({ user: userId }).populate({
      path: "book",
      select: "title author year genres",
    });

    console.log("📌 Избранные книги пользователя:", favorites);
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Добавить книгу в избранное
router.post("/", authMiddleware, async (req, res) => {
  console.log("📩 Полученные данные:", req.body);

  try {
    const { bookId } = req.body;
    const userId = req.user.userId;

    const existingFavorite = await Favorite.findOne({
      user: userId,
      book: bookId,
    });
    if (existingFavorite) {
      return res.status(400).json({ message: "Книга уже в избранном" });
    }

    const favorite = new Favorite({ user: userId, book: bookId });
    await favorite.save();
    console.log("✅ Книга добавлена в избранное:", favorite);

    res.status(201).json({ message: "Книга добавлена в избранное" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Удалить книгу из избранного
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // Убедись, что `userId` правильно получен
    const bookId = req.params.id;

    const deleted = await Favorite.findOneAndDelete({
      user: userId,
      book: bookId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Книга не найдена в избранном" });
    }

    res.json({ message: "Удалено из избранного" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
