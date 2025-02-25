const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    book: {
      // Исправлено с bookId → book
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    user: {
      // Исправлено с userId → user
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
