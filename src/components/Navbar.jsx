import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <span className="navbar-brand__icon">📸</span>
        <span className="navbar-brand__text">Photo Gallery</span>
      </NavLink>

      <div className="navbar-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `navbar-link ${isActive ? "navbar-link--active" : ""}`
          }
        >
          Gallery
        </NavLink>

        {user && (
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `navbar-link ${isActive ? "navbar-link--active" : ""}`
            }
          >
            Favorites
          </NavLink>
        )}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `navbar-link navbar-link--admin ${
                isActive ? "navbar-link--active" : ""
              }`
            }
          >
            ⚙️ Admin
          </NavLink>
        )}
      </div>

      <div className="navbar-auth">
        {user ? (
          <>
            <span className="navbar-user">
              <span className="navbar-user__avatar">
                {user.email?.charAt(0).toUpperCase()}
              </span>
              <span className="navbar-user__email">{user.email}</span>
            </span>
            <button className="navbar-auth-btn navbar-auth-btn--out" onClick={handleSignOut}>
              Sign Out
            </button>
          </>
        ) : (
          <NavLink to="/login" className="navbar-auth-btn navbar-auth-btn--in">
            Sign In
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
