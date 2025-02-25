require("dotenv").config();
const express = require("express");
console.log("🔹 JWT_SECRET:", process.env.JWT_SECRET);

const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const router = express.Router();

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("📚 Book Catalog API is running...");
});
app.get("/api/auth/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Нет токена" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: "Неверный токен" });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Неверные учетные данные" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Неверные учетные данные" });

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, userId: user._id, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;

const bookRoutes = require("./routes/bookRoutes");
app.use("/api/books", bookRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const analyticsRoutes = require("./routes/analyticsRoutes");
app.use("/api/analytics", analyticsRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

const favoritesRoutes = require("./routes/favoritesRoutes");
app.use("/api/favorites", favoritesRoutes);
app.use(express.static("public"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const reviewRoutes = require("./routes/reviewRoutes");
app.use("/api/reviews", reviewRoutes);
const statsRoutes = require("./routes/stats");
app.use("/api/stats", statsRoutes);
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
