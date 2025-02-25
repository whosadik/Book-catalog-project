const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
require("dotenv").config(); // Подключаем .env

const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refreshsuperkey";
const refreshTokens = new Set();

// 📌 Регистрация пользователя
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Этот email уже используется" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "user", // ✅ По умолчанию обычный пользователь
    });

    await newUser.save();
    res.status(201).json({ message: "Регистрация успешна!" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// 📌 Вход в систему (логин)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Неверный email или пароль" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Неверный email или пароль" });
    }

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      SECRET_KEY,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign({ userId: user._id }, REFRESH_SECRET, {
      expiresIn: "7d",
    });

    refreshTokens.add(refreshToken);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // ✅ Роль теперь точно передаётся в ответе
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// 🔹 Обновление `accessToken`
exports.refreshToken = (req, res) => {
  const { token } = req.body;
  if (!token || !refreshTokens.has(token)) {
    return res.status(403).json({ message: "Токен невалиден" });
  }

  jwt.verify(token, REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Ошибка токена" });

    const newAccessToken = jwt.sign(
      { userId: user.userId, role: user.role },
      SECRET_KEY,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  });
};

// 📌 Получение профиля пользователя
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
