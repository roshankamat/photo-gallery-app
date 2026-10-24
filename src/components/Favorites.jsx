import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import PhotoCard from "./PhotoCard";
import styles from "../styles/Gallery.module.css";

function Favorites() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!user) return;

    // Join favorites with photos to get full photo data
    const { data, error } = await supabase
      .from("favorites")
      .select("photo_id, photos(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPhotos(data.map((f) => f.photos).filter(Boolean));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFavorite = async (photoId) => {
    if (!user) return;

    // Always remove from favorites on this page
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("photo_id", photoId);

    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  if (loading) {
    return (
      <section className={styles.gallery}>
        <div className={styles.skeletonGrid}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.gallery}>
      <div className={styles.galleryHeader}>
        <h1 className={styles.heading}>Your Favorites</h1>
        <p className={styles.subheading}>
          Photos you've saved — tap the heart to remove
        </p>
      </div>

      {photos.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>♡</span>
          <p className={styles.empty}>
            You haven't favorited any photos yet — tap the ♡ on a photo to add
            it here.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              isFavorite={true}
              onToggleFavorite={toggleFavorite}
              isLoggedIn={true}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Favorites;
