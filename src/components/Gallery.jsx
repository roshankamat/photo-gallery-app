import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import defaultPhotos from "../data/photos";
import PhotoCard from "./PhotoCard";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Gallery.module.css";

function Gallery() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState(isSupabaseConfigured ? [] : defaultPhotos);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(isSupabaseConfigured);

  // Fetch all photos from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setPhotos(defaultPhotos);
      setLoading(false);
      return;
    }

    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setPhotos(data);
      } else {
        // Fallback to sample photos if DB table is empty
        setPhotos(defaultPhotos);
      }
      setLoading(false);
    };
    fetchPhotos();
  }, []);

  // Fetch user's favorites
  useEffect(() => {
    if (!user) {
      setFavoriteIds([]);
      return;
    }

    const fetchFavorites = async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("photo_id")
        .eq("user_id", user.id);

      if (!error && data) {
        setFavoriteIds(data.map((f) => f.photo_id));
      }
    };
    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (photoId) => {
    if (!user) return; // Must be logged in

    if (favoriteIds.includes(photoId)) {
      // Remove
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("photo_id", photoId);
      setFavoriteIds((prev) => prev.filter((id) => id !== photoId));
    } else {
      // Add
      await supabase
        .from("favorites")
        .insert({ user_id: user.id, photo_id: photoId });
      setFavoriteIds((prev) => [...prev, photoId]);
    }
  };

  const categories = [
    "all",
    ...new Set(photos.map((photo) => photo.category)),
  ];

  const visiblePhotos =
    selectedCategory === "all"
      ? photos
      : photos.filter((photo) => photo.category === selectedCategory);

  if (loading) {
    return (
      <section className={styles.gallery}>
        <div className={styles.skeletonGrid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.gallery}>
      <div className={styles.galleryHeader}>
        <h1 className={styles.heading}>Explore Gallery</h1>
        <p className={styles.subheading}>
          Discover stunning photography from around the world
        </p>
      </div>

      <div className={styles.filterBar}>
        {categories.map((category) => (
          <button
            key={category}
            className={`${styles.filterBtn} ${
              selectedCategory === category ? styles.filterBtnActive : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {visiblePhotos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            isFavorite={favoriteIds.includes(photo.id)}
            onToggleFavorite={toggleFavorite}
            isLoggedIn={!!user}
          />
        ))}
      </div>

      {visiblePhotos.length === 0 && (
        <p className={styles.empty}>No photos in this category yet.</p>
      )}
    </section>
  );
}

export default Gallery;
