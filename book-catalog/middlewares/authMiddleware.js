const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Нет токена" });
    }

    const token = authHeader.split(" ")[1];
    const secretKey = process.env.JWT_SECRET || "supersecretkey";
    const decoded = jwt.verify(token, secretKey);

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Неверный или просроченный токен" });
  }
};

module.exports = authMiddleware;
