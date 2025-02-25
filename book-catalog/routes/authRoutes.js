const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware"); // Добавляем middleware проверки токена
const { check, validationResult } = require("express-validator");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key"; // Если .env не загружен

// 🔹 Регистрация пользователя
router.post(
  "/register",
  [
    check("username", "Имя не может быть пустым").not().isEmpty(),
    check("email", "Введите корректный email").isEmail(),
    check("password", "Пароль должен быть минимум 6 символов").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      // Проверяем, существует ли пользователь
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Этот email уже используется" });
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);

      // Создаем нового пользователя с ролью "user"
      const user = new User({
        username,
        email,
        password: hashedPassword,
        role: "user", // Добавляем роль
      });

      await user.save();

      res.status(201).json({ message: "Регистрация успешна!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// 🔹 Авторизация (логин)
router.post(
  "/login",
  [
    check("email", "Введите корректный email").isEmail(),
    check("password", "Введите пароль").not().isEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Ищем пользователя
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Неверный email или пароль" });
      }

      // Проверяем пароль
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Неверный email или пароль" });
      }

      // Создаем JWT-токен
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// 🔹 Получение профиля пользователя (нужен токен)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});
// ✏️ Обновить профиль пользователя (нужен токен)
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Найти пользователя по ID
    let user = await User.findById(req.user.userId);
    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });

    // Обновить данные (если переданы)
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: "Профиль обновлен", user });
  } catch (err) {
    console.error("Ошибка обновления профиля:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
