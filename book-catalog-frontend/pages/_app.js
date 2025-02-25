import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Navbar /> {/* 👈 Добавили Navbar */}
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
