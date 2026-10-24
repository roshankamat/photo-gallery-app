import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
  getInitialPhotoUrl,
  getProxyImageUrl,
  getCategoryFallback,
} from "../utils/imageUrl";
import styles from "../styles/PhotoDetail.module.css";

function PhotoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [photo, setPhoto] = useState(null);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState("");
  const [imgAttempt, setImgAttempt] = useState(0);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchPhoto = async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("id", Number(id))
        .single();

      if (!error && data) {
        setPhoto(data);
        setCurrentSrc(getInitialPhotoUrl(data.url, data.category, data.title));
        setImgAttempt(0);
        setImgError(false);
      }
      setLoading(false);
    };
    fetchPhoto();
  }, [id]);

  const handleImageError = () => {
    if (imgAttempt === 0 && photo) {
      const proxy = getProxyImageUrl(photo.url);
      if (proxy && proxy !== currentSrc) {
        setImgAttempt(1);
        setCurrentSrc(proxy);
        return;
      }
    }
    if (imgAttempt < 2 && photo) {
      setImgAttempt(2);
      setCurrentSrc(getCategoryFallback(photo.category, photo.title));
      return;
    }
    setImgError(true);
  };

  // Check favorite status
  useEffect(() => {
    if (!user || !photo) return;

    const checkFav = async () => {
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("photo_id", photo.id)
        .maybeSingle();

      setIsFav(!!data);
    };
    checkFav();
  }, [user, photo]);

  const toggleFavorite = async () => {
    if (!user || !photo) return;

    if (isFav) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("photo_id", photo.id);
      setIsFav(false);
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: user.id, photo_id: photo.id });
      setIsFav(true);
    }
  };

  if (loading) {
    return (
      <div className={styles.detail}>
        <div className={styles.detailSkeleton} />
      </div>
    );
  }

  if (!photo) {
    return (
      <div className={styles.detail}>
        <div className={styles.notFound}>
          <h2>Photo not found</h2>
          <p>The photo you're looking for doesn't exist or has been removed.</p>
          <button className={styles.backBtn} onClick={() => navigate("/")}>
            ← Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.detail}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className={styles.detailContent}>
        <div className={styles.detailImageWrap}>
          {!imgError ? (
            <img
              src={currentSrc}
              alt={photo.title}
              className={styles.detailImage}
              referrerPolicy="no-referrer"
              onError={handleImageError}
            />
          ) : (
            <div className={styles.detailFallbackBox}>
              <span className={styles.detailFallbackIcon}>🖼️</span>
              <p>Image preview unavailable</p>
            </div>
          )}
        </div>
        <div className={styles.detailInfo}>
          <h2 className={styles.detailTitle}>{photo.title}</h2>
          <span className={styles.detailCategory}>{photo.category}</span>
          <p className={styles.detailDate}>
            Added {new Date(photo.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          {user && (
            <button
              className={`${styles.favoriteToggle} ${
                isFav ? styles.favoriteToggleActive : ""
              }`}
              onClick={toggleFavorite}
            >
              {isFav ? "♥ Remove from Favorites" : "♡ Add to Favorites"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PhotoDetail;
