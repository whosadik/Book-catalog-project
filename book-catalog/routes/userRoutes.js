const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const router = express.Router();

// 📌 Получить профиль пользователя
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Ошибка загрузки профиля" });
  }
});

// 📌 Обновить профиль пользователя
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: "Профиль обновлен" });
  } catch (error) {
    console.error("❌ Ошибка обновления профиля:", error);
    res.status(500).json({ message: "Ошибка обновления профиля" });
  }
});

module.exports = router;
