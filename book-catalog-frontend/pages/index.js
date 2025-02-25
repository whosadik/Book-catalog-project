import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { motion } from "framer-motion";

export default function HomePage() {
  const [randomBook, setRandomBook] = useState(null);

  useEffect(() => {
    async function fetchRandomBook() {
      try {
        const res = await fetch("http://localhost:5000/api/books/random");
        const data = await res.json();
        setRandomBook(data);
      } catch (error) {
        console.error("Ошибка загрузки случайной книги", error);
      }
    }
    fetchRandomBook();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h3" align="center" gutterBottom>
          Добро пожаловать в каталог книг 📚
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" paragraph>
          Здесь вы можете найти любимые книги, добавить их в избранное и
          оставить отзывы.
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {/* Случайная книга */}
          {randomBook && (
            <Grid item xs={12} sm={6}>
              <Card
                component={motion.div}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent>
                  <Typography variant="h5">{randomBook.title}</Typography>
                  <Typography color="textSecondary">
                    {randomBook.author}
                  </Typography>
                  <Typography variant="body2">
                    Год: {randomBook.year}
                  </Typography>
                  <Button
                    size="small"
                    component={Link}
                    href={`/books/${randomBook._id}`}
                  >
                    Подробнее
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Кнопка для перехода к книгам */}
          <Grid item xs={12} sm={6}>
            <Card
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent>
                <Typography variant="h5">Список книг</Typography>
                <Typography color="textSecondary">
                  Все книги в одном месте
                </Typography>
                <Button size="small" component={Link} href="/books">
                  Смотреть книги
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
}
