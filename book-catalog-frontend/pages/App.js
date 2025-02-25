import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./login";
import ProfilePage from "./profile";
import FavouritesPage from "./favourites";
// import HomePage from "./HomePage"; // Если у тебя есть главная страница

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Если есть HomePage, раскомментируй */}
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/favourites" element={<FavouritesPage />} />{" "}
        {/* ✅ Добавлен маршрут */}
      </Routes>
    </Router>
  );
}
