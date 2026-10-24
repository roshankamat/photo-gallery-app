/**
 * Utility helpers to handle, clean, and resolve photo URLs.
 * Solves common issues where users paste webpage links (e.g. .html),
 * Google Images search links, Google Drive sharing links, or hotlink-protected links.
 */

// Curated high-resolution fallback photos by category
export const CATEGORY_FALLBACKS = {
  car: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80", // BMW M4 Coupe
  cars: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80",
  nature: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
  urban: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80",
  animals: "https://images.unsplash.com/photo-1534361960057-19889db98a1e?auto=format&fit=crop&w=1200&q=80",
  architecture: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  travel: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
  default: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80",
};

/**
 * Checks if a string looks like an HTML webpage URL rather than a direct image link.
 */
export function isLikelyWebpage(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim().toLowerCase();

  // Explicit webpage extensions
  if (/\.(html?|php|aspx?|jsp)(\?.*)?$/i.test(trimmed)) {
    return true;
  }

  // Common webpage URL patterns that users accidentally paste
  if (
    trimmed.includes("bmw.in/") ||
    trimmed.includes("bmw.com/") ||
    trimmed.includes("unsplash.com/photos/") ||
    trimmed.includes("pexels.com/photo/") ||
    trimmed.includes("shutterstock.com/image-") ||
    trimmed.includes("pinterest.com/pin/") ||
    trimmed.includes("instagram.com/p/")
  ) {
    // If it doesn't end with a direct image extension, it's a webpage
    const hasImageExt = /\.(jpe?g|png|webp|gif|svg|avif)(\?.*)?$/i.test(trimmed);
    const isUnsplashDirect = trimmed.includes("images.unsplash.com");
    const isPexelsDirect = trimmed.includes("images.pexels.com");
    if (!hasImageExt && !isUnsplashDirect && !isPexelsDirect) {
      return true;
    }
  }

  return false;
}

/**
 * Cleans and converts common user-pasted URLs (Google images, Google Drive, etc.)
 * into direct image links.
 */
export function cleanAndNormalizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  let url = rawUrl.trim().replace(/^["']|["']$/g, "");

  try {
    // 1. Google Images unwrapping: e.g. https://www.google.com/imgres?imgurl=https%3A%2F%2F...
    if (url.includes("google.") && (url.includes("/imgres") || url.includes("/url"))) {
      const parsed = new URL(url);
      const imgurl = parsed.searchParams.get("imgurl") || parsed.searchParams.get("url");
      if (imgurl) {
        return decodeURIComponent(imgurl);
      }
    }

    // 2. Google Drive share link: https://drive.google.com/file/d/ID/view?usp=sharing
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    }

    // 3. Dropbox links: change dl=0 to raw=1
    if (url.includes("dropbox.com") && url.includes("dl=0")) {
      return url.replace("dl=0", "raw=1");
    }

    // 4. Imgur single image page: https://imgur.com/ABC1234 -> https://i.imgur.com/ABC1234.jpg
    const imgurMatch = url.match(/imgur\.com\/([a-zA-Z0-9]+)$/);
    if (imgurMatch && imgurMatch[1] && !["a", "gallery"].includes(imgurMatch[1])) {
      return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
    }
  } catch (e) {
    // Ignore URL parse errors and return original trimmed
  }

  return url;
}

/**
 * Returns a suitable fallback image URL based on title or category.
 */
export function getCategoryFallback(category = "", title = "") {
  const cat = String(category).toLowerCase().trim();
  const t = String(title).toLowerCase().trim();

  if (cat.includes("car") || t.includes("bmw") || t.includes("car") || t.includes("m4") || t.includes("auto")) {
    return CATEGORY_FALLBACKS.car;
  }
  if (cat.includes("nature") || t.includes("mountain") || t.includes("forest") || t.includes("lake") || t.includes("trail")) {
    return CATEGORY_FALLBACKS.nature;
  }
  if (cat.includes("urban") || t.includes("city") || t.includes("building") || t.includes("skyline") || t.includes("bridge")) {
    return CATEGORY_FALLBACKS.urban;
  }
  if (cat.includes("animal") || t.includes("dog") || t.includes("fox") || t.includes("cat")) {
    return CATEGORY_FALLBACKS.animals;
  }

  return CATEGORY_FALLBACKS[cat] || CATEGORY_FALLBACKS.default;
}

/**
 * Resolves the primary URL to load. If it's detected as a webpage, returns the fallback image.
 */
export function getInitialPhotoUrl(url, category = "", title = "") {
  if (!url) return getCategoryFallback(category, title);
  const cleaned = cleanAndNormalizeUrl(url);
  if (isLikelyWebpage(cleaned)) {
    return getCategoryFallback(category, title);
  }
  return cleaned;
}

/**
 * Proxy URL via weserv.nl to bypass hotlinking or CORS blocks.
 */
export function getProxyImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (url.includes("images.weserv.nl") || url.startsWith("data:")) return url;
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
}
