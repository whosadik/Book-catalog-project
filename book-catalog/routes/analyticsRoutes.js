const express = require("express");
const Book = require("../models/Book");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// 📊 1. Средний рейтинг книг по жанрам
router.get("/average-rating-by-genre", async (req, res) => {
  try {
    const result = await Book.aggregate([
      { $unwind: "$genres" },
      { $group: { _id: "$genres", avgRating: { $avg: "$rating" } } },
      { $sort: { avgRating: -1 } },
    ]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 2. Топ-5 популярных жанров (по количеству книг)
router.get("/top-genres", async (req, res) => {
  try {
    const result = await Book.aggregate([
      { $unwind: "$genres" },
      { $group: { _id: "$genres", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 3. Топ-5 книг с лучшим рейтингом
router.get("/top-books", async (req, res) => {
  try {
    const books = await Book.find().sort({ rating: -1 }).limit(5);
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
