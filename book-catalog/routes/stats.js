const express = require("express");
const Book = require("../models/Book");
const Review = require("../models/Review");
const Favorite = require("../models/Favorite");

const router = express.Router();

// 📊 1. Количество книг по жанрам
router.get("/books-by-genre", async (req, res) => {
  try {
    const booksByGenre = await Book.aggregate([
      { $unwind: "$genres" },
      { $group: { _id: "$genres", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json(booksByGenre);
  } catch (err) {
    res.status(500).json({ error: "Ошибка получения статистики" });
  }
});

// 🔥 2. Топ-5 книг по количеству отзывов
router.get("/top-reviewed-books", async (req, res) => {
  try {
    const topReviewedBooks = await Review.aggregate([
      { $group: { _id: "$bookId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book",
        },
      },
      { $unwind: "$book" },
    ]);

    res.json(topReviewedBooks);
  } catch (err) {
    res.status(500).json({ error: "Ошибка получения статистики" });
  }
});

// ❤️ 3. Самые популярные книги (избранные)
router.get("/top-favorite-books", async (req, res) => {
  try {
    const topFavoriteBooks = await Favorite.aggregate([
      { $group: { _id: "$book", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book",
        },
      },
      { $unwind: "$book" },
    ]);

    res.json(topFavoriteBooks);
  } catch (err) {
    res.status(500).json({ error: "Ошибка получения статистики" });
  }
});

module.exports = router;
