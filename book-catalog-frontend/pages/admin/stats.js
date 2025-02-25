import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function AdminStatsPage() {
  const [booksByGenre, setBooksByGenre] = useState([]);
  const [topReviewedBooks, setTopReviewedBooks] = useState([]);
  const [topFavoriteBooks, setTopFavoriteBooks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/stats/books-by-genre")
      .then((res) => res.json())
      .then((data) => setBooksByGenre(data));

    fetch("http://localhost:5000/api/stats/top-reviewed-books")
      .then((res) => res.json())
      .then((data) => setTopReviewedBooks(data));

    fetch("http://localhost:5000/api/stats/top-favorite-books")
      .then((res) => res.json())
      .then((data) => setTopFavoriteBooks(data));
  }, []);

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1>📊 Статистика</h1>

      {/* 🔹 Количество книг по жанрам */}
      <h2>📚 Количество книг по жанрам</h2>
      {booksByGenre.length > 0 ? (
        <Pie
          data={{
            labels: booksByGenre.map((g) => g._id),
            datasets: [
              {
                label: "Книги",
                data: booksByGenre.map((g) => g.count),
                backgroundColor: [
                  "#FF6384",
                  "#36A2EB",
                  "#FFCE56",
                  "#4CAF50",
                  "#9C27B0",
                ],
              },
            ],
          }}
        />
      ) : (
        <p>Загрузка...</p>
      )}

      {/*  Самые популярные книги (избранные) */}
      <h2>❤️ Самые популярные книги</h2>
      {topFavoriteBooks.length > 0 ? (
        <div className="chart-container">
          <Bar
            data={{
              labels: topFavoriteBooks.map((b) => b.book.title),
              datasets: [
                {
                  label: "Избранные",
                  data: topFavoriteBooks.map((b) => b.count),
                  backgroundColor: "#36A2EB",
                },
              ],
            }}
            options={{
              maintainAspectRatio: false, // Позволяет задавать кастомную высоту и ширину
              responsive: true,
              plugins: {
                legend: { display: false }, // Убираем легенду, если не нужна
              },
              scales: {
                y: {
                  ticks: { font: { size: 12 } }, // Уменьшаем шрифт оси Y
                },
                x: {
                  ticks: {
                    font: { size: 12 },
                    maxRotation: 45,
                    minRotation: 0,
                  }, // Подгоняем ось X
                },
              },
            }}
            height={300} // Изменяем высоту
            width={600} // Изменяем ширину
          />
        </div>
      ) : (
        <p>Загрузка...</p>
      )}
    </div>
  );
}
