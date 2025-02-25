const express = require("express");
const User = require("../models/User");
const Book = require("../models/Book");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// 📌 Проверка, является ли пользователь админом
const adminMiddleware = (req, res, next) => {
  console.log("🔹 Запрос на удаление от:", req.user);
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

// 📚 1. Получить всех пользователей (только для админов)
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🛠 2. Изменить роль пользователя (только для админов)
router.put("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ❌ 3. Удалить пользователя (только для админов)
router.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "User deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// 📚 4. CRUD для книг (админ может изменять и удалять)
router.post("/books", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/books/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete(
  "/books/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      await Book.findByIdAndDelete(req.params.id);
      res.json({ message: "Книга удалена" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
