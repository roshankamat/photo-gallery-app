import React from "react";
import "../styles/LoadingSpinner.css";

function LoadingSpinner({ message = "Loading…" }) {
  return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p className="loading-text">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
