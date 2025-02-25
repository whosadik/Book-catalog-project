import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFilteredBooks } from "../../utils/api";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import Link from "next/link";
import "../../styles/books.css"; // ✅ Подключаем стили

export default function BooksPage() {
  const [tempFilters, setTempFilters] = useState({
    title: "",
    genre: "",
    year: "",
    sortBy: "title",
  });

  const [filters, setFilters] = useState(tempFilters);

  const {
    data: books = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["books", filters],
    queryFn: () => fetchFilteredBooks(filters),
  });

  const handleTempFilterChange = (e) => {
    setTempFilters({ ...tempFilters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    refetch();
  };

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка загрузки данных</p>;

  return (
    <Container>
      <h1 className="page-title">Каталог книг</h1>

      <div className="filters">
        <TextField
          name="title"
          label="Название"
          variant="outlined"
          size="small"
          value={tempFilters.title}
          onChange={handleTempFilterChange}
        />
        <TextField
          name="genre"
          label="Жанр"
          variant="outlined"
          size="small"
          value={tempFilters.genre}
          onChange={handleTempFilterChange}
        />
        <TextField
          name="year"
          label="Год"
          type="number"
          variant="outlined"
          size="small"
          value={tempFilters.year}
          onChange={handleTempFilterChange}
        />
        <TextField
          name="sortBy"
          select
          label="Сортировать по"
          variant="outlined"
          size="small"
          value={tempFilters.sortBy}
          onChange={handleTempFilterChange}
        >
          <MenuItem value="title">Название (А-Я)</MenuItem>
          <MenuItem value="rating">Рейтинг</MenuItem>
          <MenuItem value="year">Год</MenuItem>
        </TextField>
        <Button variant="contained" onClick={applyFilters}>
          Применить
        </Button>
      </div>

      {/* 🔹 Список книг */}
      <Grid container spacing={3} className="books-container">
        {books.map((book) => (
          <Grid item key={book._id} xs={12} sm={6} md={4} lg={3}>
            <Card className="book-card">
              <CardContent className="book-content">
                <Typography variant="h6" className="book-title">
                  {book.title}
                </Typography>
                <Typography variant="subtitle1" className="book-author">
                  {book.author}
                </Typography>
                <Typography variant="subtitle2" className="book-genre">
                  Жанр: {book.genres.join(", ")}
                </Typography>
                <Typography variant="subtitle2" className="book-year">
                  Год: {book.year}
                </Typography>
                <Link href={`/books/${book._id}`} className="book-link">
                  Подробнее
                </Link>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
