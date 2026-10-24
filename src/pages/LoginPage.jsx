import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isSupabaseConfigured } from "../lib/supabase";
import "../styles/LoginPage.css";

function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  // Already logged in → redirect to gallery
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError(
        "Supabase credentials are not connected yet! Please add your REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to .env."
      );
      return;
    }
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await signUp(email, password);
        if (signUpError) throw signUpError;
        setSuccess(
          "Account created! Check your email to confirm, then log in."
        );
        setIsSignUp(false);
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) throw signInError;
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background orbs */}
      <div className="login-bg-orb login-bg-orb--1" />
      <div className="login-bg-orb login-bg-orb--2" />
      <div className="login-bg-orb login-bg-orb--3" />

      <div className="login-card">
        <div className="login-card__header">
          <span className="login-card__icon">📸</span>
          <h1 className="login-card__title">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="login-card__subtitle">
            {isSignUp
              ? "Join the gallery community"
              : "Sign in to your account"}
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="login-alert login-alert--error" style={{ background: "rgba(234, 179, 8, 0.15)", borderColor: "rgba(234, 179, 8, 0.4)", color: "#facc15" }}>
            <span>⚡</span> Supabase backend not yet linked. Provide your Project URL & Anon Key to enable live authentication!
          </div>
        )}

        {error && (
          <div className="login-alert login-alert--error">
            <span>⚠</span> {error}
          </div>
        )}
        {success && (
          <div className="login-alert login-alert--success">
            <span>✓</span> {success}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-email" className="login-label">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              className="login-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password" className="login-label">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="login-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={submitting}
          >
            {submitting
              ? "Please wait…"
              : isSignUp
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        <div className="login-toggle">
          <span>
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
          </span>
          <button
            type="button"
            className="login-toggle-btn"
            onClick={() => {
              setIsSignUp((prev) => !prev);
              setError("");
              setSuccess("");
            }}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
