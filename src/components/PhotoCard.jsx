import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getInitialPhotoUrl,
  getProxyImageUrl,
  getCategoryFallback,
} from "../utils/imageUrl";
import styles from "../styles/PhotoCard.module.css";

function PhotoCard({ photo, isFavorite, onToggleFavorite, isLoggedIn = false }) {
  const [currentSrc, setCurrentSrc] = useState(() =>
    getInitialPhotoUrl(photo.url, photo.category, photo.title)
  );
  const [attempt, setAttempt] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(getInitialPhotoUrl(photo.url, photo.category, photo.title));
    setAttempt(0);
    setHasError(false);
  }, [photo.url, photo.category, photo.title]);

  const handleImageError = () => {
    if (attempt === 0) {
      // First try proxying the URL in case of CORS / hotlinking block
      const proxy = getProxyImageUrl(photo.url);
      if (proxy && proxy !== currentSrc) {
        setAttempt(1);
        setCurrentSrc(proxy);
        return;
      }
    }

    if (attempt < 2) {
      // Fallback to high quality category image (e.g. BMW for car)
      setAttempt(2);
      setCurrentSrc(getCategoryFallback(photo.category, photo.title));
      return;
    }

    // Both failed
    setHasError(true);
  };

  const heartStyle = {
    color: isFavorite ? "#ff4d6d" : "#ffffff",
    transform: isFavorite ? "scale(1.15)" : "scale(1)",
  };

  return (
    <div className={styles.card}>
      <Link to={`/photo/${photo.id}`} className={styles.cardLink}>
        <div className={styles.imageWrap}>
          {!hasError ? (
            <img
              src={currentSrc}
              alt={photo.title}
              className={styles.image}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={handleImageError}
            />
          ) : (
            <div className={styles.fallbackBox}>
              <span className={styles.fallbackIcon}>🖼️</span>
              <span className={styles.fallbackText}>{photo.title}</span>
            </div>
          )}
          <div className={styles.shimmer} />
        </div>
        <div className={styles.overlay}>
          <h3 className={styles.title}>{photo.title}</h3>
          <span className={styles.category}>{photo.category}</span>
        </div>
      </Link>
      {isLoggedIn && (
        <button
          className={styles.favoriteBtn}
          style={heartStyle}
          onClick={() => onToggleFavorite(photo.id)}
          aria-label="Toggle favorite"
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      )}
    </div>
  );
}

export default PhotoCard;
