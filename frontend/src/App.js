import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import HomePage from "@/pages/HomePage";
import MoviesPage from "@/pages/MoviesPage";
import MovieDetailsPage from "@/pages/MovieDetailsPage";
import SeatSelectionPage from "@/pages/SeatSelectionPage";
import CheckoutPage from "@/pages/CheckoutPage";
import MyBookingsPage from "@/pages/MyBookingsPage";
import AuthPage from "@/pages/AuthPage";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user", error);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  if (loading) {
    return (
      <div className="cinema-bg min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <div className="cinema-bg min-h-screen">
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/movies/:id" element={<MovieDetailsPage />} />
            <Route path="/select-seats/:showtimeId" element={<SeatSelectionPage />} />
            <Route path="/checkout" element={user ? <CheckoutPage /> : <Navigate to="/auth" />} />
            <Route path="/my-bookings" element={user ? <MyBookingsPage /> : <Navigate to="/auth" />} />
            <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
          </Routes>
          <Toaster position="top-center" />
        </BrowserRouter>
      </div>
    </AuthContext.Provider>
  );
}

import React from "react";
export default App;