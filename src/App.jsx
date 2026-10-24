import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Gallery from "./components/Gallery";
import Favorites from "./components/Favorites";
import PhotoDetail from "./components/PhotoDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import { useAuth } from "./context/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";
import "./styles/App.css";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Starting up…" />;
  }

  return (
    <div className="app">
      <Navbar />
      <main className="app-main">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Gallery />} />
          <Route path="/photo/:id" element={<PhotoDetail />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected: must be logged in */}
          <Route
            path="/favorites"
            element={
              <ProtectedRoute requireAuth>
                <Favorites />
              </ProtectedRoute>
            }
          />

          {/* Protected: must be admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAuth requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <div className="not-found">
                <h2>404</h2>
                <p>Page not found</p>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
