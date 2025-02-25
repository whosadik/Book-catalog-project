const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genres: [{ type: String, required: true }],
  year: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  reviews: [
    {
      user: String,
      comment: String,
      rating: Number,
      date: { type: Date, default: Date.now },
    },
  ],
});

const Book = mongoose.model("Book", BookSchema);
module.exports = Book;
BookSchema.index({ title: "text", description: "text" });
BookSchema.index({ title: "text", description: "text" }); // Полнотекстовый поиск
BookSchema.index({ author: 1 }); // Быстрый поиск по автору
BookSchema.index({ genres: 1 }); // Быстрая фильтрация по жанрам
BookSchema.index({ year: -1 }); // Оптимизация сортировки по году
