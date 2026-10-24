import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Route guard component.
 * - requireAuth: redirect to /login if not authenticated
 * - requireAdmin: redirect to / if not an admin
 */
function ProtectedRoute({ children, requireAuth = false, requireAdmin = false }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
