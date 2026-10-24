import { useState, useEffect } from "react";

// Custom hook: encapsulates the "favoriting" state + logic so any component
// can read/toggle favorites without duplicating useState calls everywhere.
// Demonstrates useState (state) and useEffect (side effect: persistence).
export default function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState(() => {
    const stored = localStorage.getItem("favoritePhotoIds");
    return stored ? JSON.parse(stored) : [];
  });

  // Side effect: whenever favorites change, sync them to localStorage.
  useEffect(() => {
    localStorage.setItem("favoritePhotoIds", JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const toggleFavorite = (id) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const isFavorite = (id) => favoriteIds.includes(id);

  return { favoriteIds, toggleFavorite, isFavorite };
}
