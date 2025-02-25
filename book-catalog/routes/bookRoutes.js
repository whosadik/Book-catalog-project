const express = require("express");
const Book = require("../models/Book");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/filter", async (req, res) => {
  try {
    let filter = {};

    if (req.query.title) {
      filter.title = { $regex: req.query.title, $options: "i" };
    }

    if (req.query.genre) {
      const genresArray = req.query.genre.split(",").map((g) => g.trim());
      filter.genres = { $in: genresArray };
    }

    if (req.query.year && !isNaN(req.query.year)) {
      filter.year = parseInt(req.query.year, 10);
    }

    if (req.query.minRating && !isNaN(req.query.minRating)) {
      filter.rating = { $gte: parseFloat(req.query.minRating) };
    }
    if (req.query.maxRating && !isNaN(req.query.maxRating)) {
      filter.rating = {
        ...filter.rating,
        $lte: parseFloat(req.query.maxRating),
      };
    }

    let sortBy = {};
    if (req.query.sortBy === "rating") sortBy.rating = -1;
    if (req.query.sortBy === "year") sortBy.year = -1;
    if (req.query.sortBy === "title") sortBy.title = 1;

    console.log("🔍 Применён фильтр:", filter, "Сортировка:", sortBy);

    const books = await Book.find(filter).sort(sortBy);
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    const books = await Book.find({ title: { $regex: query, $options: "i" } });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/random", async (req, res) => {
  try {
    const count = await Book.countDocuments();

    if (count === 0) {
      return res.status(404).json({ message: "Книг нет в базе" });
    }

    const randomIndex = Math.floor(Math.random() * count);
    const books = await Book.find().limit(1).skip(randomIndex);

    if (!books.length) {
      return res.status(404).json({ message: "Не удалось найти книгу" });
    }

    res.json(books[0]);
  } catch (err) {
    console.error("❌ Ошибка генерации случайной книги:", err);
    res.status(500).json({ message: "Ошибка получения случайной книги" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Книга не найдена" });

    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/add", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Доступ запрещен" });
    }

    const { title, author, genres, year, rating } = req.body;

    const book = new Book({
      title,
      author,
      genres: genres.split(",").map((g) => g.trim()),
      year: parseInt(year),
      rating: parseFloat(rating),
    });

    await book.save();
    res.status(201).json({ message: "Книга добавлена", book });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Доступ запрещен" });
    }

    const { id } = req.params;
    const updatedBook = await Book.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedBook)
      return res.status(404).json({ message: "Книга не найдена" });

    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  console.log("🔹 Запрос на удаление от:", req.user);

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Книга удалена" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
