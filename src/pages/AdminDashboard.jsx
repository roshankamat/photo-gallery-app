import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import {
  cleanAndNormalizeUrl,
  isLikelyWebpage,
  getCategoryFallback,
  CATEGORY_FALLBACKS,
  getInitialPhotoUrl,
} from "../utils/imageUrl";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();

  // ── State ───────────────────────────────────────────────
  const [photos, setPhotos] = useState([]);
  const [users, setUsers] = useState([]);
  const [favCount, setFavCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Form state for adding / editing a photo
  const [form, setForm] = useState({
    title: "",
    category: "",
    url: "",
  });
  const [previewStatus, setPreviewStatus] = useState("idle");
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // ── Data fetching ───────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoadingData(true);

    const [photosRes, usersRes, favsRes] = await Promise.all([
      supabase.from("photos").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("favorites").select("id", { count: "exact", head: true }),
    ]);

    if (photosRes.data) setPhotos(photosRes.data);
    if (usersRes.data) setUsers(usersRes.data);
    setFavCount(favsRes.count ?? 0);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, fetchData]);

  // ── Guards ──────────────────────────────────────────────
  if (authLoading) return null;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  // ── Photo CRUD ──────────────────────────────────────────
  const resetForm = () => {
    setForm({ title: "", category: "", url: "" });
    setEditingId(null);
    setFormError("");
    setFormSuccess("");
    setPreviewStatus("idle");
  };

  const handleUrlChange = (value) => {
    const cleaned = cleanAndNormalizeUrl(value);
    setForm((prev) => ({ ...prev, url: cleaned }));
    if (cleaned) {
      setPreviewStatus("loading");
    } else {
      setPreviewStatus("idle");
    }
  };

  const handleSavePhoto = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const cleanUrl = cleanAndNormalizeUrl(form.url);
    if (!form.title || !cleanUrl) {
      setFormError("Title and URL are required.");
      return;
    }

    if (isLikelyWebpage(cleanUrl)) {
      setFormError(
        "The URL you entered is an HTML webpage (.html), not an image file! Please right-click the photo on that site and select 'Copy Image Address' (ending in .jpg, .png, etc.), or use the suggested direct image link."
      );
      return;
    }

    if (editingId) {
      // UPDATE
      const { error } = await supabase
        .from("photos")
        .update({
          title: form.title.trim(),
          category: form.category.trim() || "uncategorized",
          url: cleanUrl,
        })
        .eq("id", editingId);

      if (error) {
        setFormError(error.message);
      } else {
        setFormSuccess("Photo updated successfully!");
        resetForm();
        fetchData();
      }
    } else {
      // INSERT
      const { error } = await supabase.from("photos").insert({
        title: form.title.trim(),
        category: form.category.trim() || "uncategorized",
        url: cleanUrl,
        uploaded_by: user.id,
      });

      if (error) {
        setFormError(error.message);
      } else {
        setFormSuccess("Photo added successfully!");
        resetForm();
        fetchData();
      }
    }
  };

  const handleEditPhoto = (photo) => {
    setForm({
      title: photo.title,
      category: photo.category,
      url: photo.url,
    });
    setEditingId(photo.id);
    setActiveTab("photos");
    setFormError("");
    setFormSuccess("");
    setPreviewStatus(photo.url ? "loading" : "idle");
  };

  const handleQuickFixUrl = async (photo) => {
    const fallbackUrl = getCategoryFallback(photo.category, photo.title);
    const { error } = await supabase
      .from("photos")
      .update({ url: fallbackUrl })
      .eq("id", photo.id);

    if (error) {
      setFormError("Failed to update photo: " + error.message);
    } else {
      setFormSuccess(`Fixed "${photo.title}" with a working high-res direct image!`);
      fetchData();
    }
  };

  const handleDeletePhoto = async (id) => {
    if (!window.confirm("Delete this photo permanently?")) return;
    const { error } = await supabase.from("photos").delete().eq("id", id);
    if (!error) fetchData();
  };

  // ── Render ──────────────────────────────────────────────
  return (
    <div className="admin">
      <div className="admin__header">
        <h1 className="admin__title">
          <span className="admin__title-icon">⚙️</span> Admin Dashboard
        </h1>
        <p className="admin__subtitle">Manage your photo gallery</p>
      </div>

      {/* Tab Navigation */}
      <div className="admin__tabs">
        {["overview", "photos", "users"].map((tab) => (
          <button
            key={tab}
            className={`admin__tab ${
              activeTab === tab ? "admin__tab--active" : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "overview" && "📊 "}
            {tab === "photos" && "🖼️ "}
            {tab === "users" && "👥 "}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loadingData ? (
        <div className="admin__loading">
          <div className="admin__spinner" />
          <p>Loading dashboard…</p>
        </div>
      ) : (
        <>
          {/* ─── OVERVIEW TAB ─── */}
          {activeTab === "overview" && (
            <div className="admin__overview">
              <div className="stat-card stat-card--photos">
                <div className="stat-card__icon">🖼️</div>
                <div className="stat-card__info">
                  <span className="stat-card__value">{photos.length}</span>
                  <span className="stat-card__label">Total Photos</span>
                </div>
              </div>
              <div className="stat-card stat-card--users">
                <div className="stat-card__icon">👥</div>
                <div className="stat-card__info">
                  <span className="stat-card__value">{users.length}</span>
                  <span className="stat-card__label">Registered Users</span>
                </div>
              </div>
              <div className="stat-card stat-card--favs">
                <div className="stat-card__icon">♥</div>
                <div className="stat-card__info">
                  <span className="stat-card__value">{favCount}</span>
                  <span className="stat-card__label">Total Favorites</span>
                </div>
              </div>

              {/* Recent Photos */}
              <div className="admin__recent">
                <h3 className="admin__section-title">Recent Photos</h3>
                <div className="admin__recent-grid">
                  {photos.slice(0, 6).map((photo) => (
                    <div key={photo.id} className="admin__recent-card">
                      <img
                        src={getInitialPhotoUrl(photo.url, photo.category, photo.title)}
                        alt={photo.title}
                        referrerPolicy="no-referrer"
                      />
                      <div className="admin__recent-info">
                        <span>{photo.title}</span>
                        <span className="admin__recent-cat">
                          {photo.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── PHOTOS TAB ─── */}
          {activeTab === "photos" && (
            <div className="admin__photos">
              {/* Add / Edit Form */}
              <div className="admin__form-card">
                <h3 className="admin__section-title">
                  {editingId ? "✏️ Edit Photo" : "➕ Add New Photo"}
                </h3>

                {formError && (
                  <div className="admin__alert admin__alert--error">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="admin__alert admin__alert--success">
                    {formSuccess}
                  </div>
                )}

                <form className="admin__form" onSubmit={handleSavePhoto}>
                  <div className="admin__form-row">
                    <div className="admin__field">
                      <label htmlFor="photo-title">Title</label>
                      <input
                        id="photo-title"
                        type="text"
                        placeholder="Photo title"
                        value={form.title}
                        onChange={(e) =>
                          setForm({ ...form, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="admin__field">
                      <label htmlFor="photo-category">Category</label>
                      <input
                        id="photo-category"
                        type="text"
                        placeholder="e.g. nature, urban, animals"
                        value={form.category}
                        onChange={(e) =>
                          setForm({ ...form, category: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="admin__field">
                    <label htmlFor="photo-url">Image URL</label>
                    <input
                      id="photo-url"
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={form.url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      required
                    />
                    <div className="admin__url-guide">
                      💡 Tip: Use a direct image URL ending in .jpg, .png, .webp (Right-click photo on web → "Copy Image Address").
                    </div>
                  </div>

                  {isLikelyWebpage(form.url) && (
                    <div className="admin__alert--warning">
                      <strong>⚠️ Webpage link detected:</strong> This URL is a webpage (<code>.html</code>), not an image file. Image elements can only display actual image files.
                      <br />
                      <strong>How to fix:</strong> Open that website, right-click the car image itself, and choose <em>"Copy Image Address"</em>.
                      {/bmw|car|m4/i.test(`${form.title} ${form.category}`) && (
                        <div style={{ marginTop: "10px" }}>
                          <button
                            type="button"
                            className="admin__btn--preset"
                            onClick={() => {
                              setForm((prev) => ({ ...prev, url: CATEGORY_FALLBACKS.car }));
                              setPreviewStatus("loading");
                            }}
                          >
                            💡 Use Verified High-Res BMW M4 Image
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {form.url && (
                    <div className="admin__preview">
                      <div className="admin__preview-header">
                        <span className="admin__preview-label">Live Image Preview</span>
                        <span
                          className={`admin__preview-status admin__preview-status--${
                            previewStatus === "success"
                              ? "success"
                              : previewStatus === "error"
                              ? "error"
                              : "loading"
                          }`}
                        >
                          {previewStatus === "success" && "✓ Valid Image"}
                          {previewStatus === "error" && "✗ Image Failed to Load"}
                          {previewStatus === "loading" && "⏳ Checking image..."}
                        </span>
                      </div>
                      <div className="admin__preview-content">
                        <img
                          src={form.url}
                          alt="Preview"
                          referrerPolicy="no-referrer"
                          onLoad={() => setPreviewStatus("success")}
                          onError={() => setPreviewStatus("error")}
                          style={{ display: previewStatus === "error" ? "none" : "block" }}
                        />
                        {previewStatus === "error" && (
                          <div className="admin__preview-error">
                            <p>⚠️ Cannot display image from this link.</p>
                            <small>
                              {isLikelyWebpage(form.url)
                                ? "This is a webpage link, not a photo."
                                : "Make sure the link is a direct image file (.jpg, .png, etc.)"}
                            </small>
                            {/bmw|car|m4/i.test(`${form.title} ${form.category}`) && (
                              <div>
                                <button
                                  type="button"
                                  className="admin__btn--preset"
                                  onClick={() => {
                                    setForm((prev) => ({ ...prev, url: CATEGORY_FALLBACKS.car }));
                                    setPreviewStatus("loading");
                                  }}
                                >
                                  💡 Use Verified BMW M4 Image
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="admin__form-actions">
                    <button type="submit" className="admin__btn admin__btn--primary">
                      {editingId ? "Update Photo" : "Add Photo"}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        className="admin__btn admin__btn--ghost"
                        onClick={resetForm}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Photos Table */}
              <div className="admin__table-card">
                <h3 className="admin__section-title">
                  All Photos ({photos.length})
                </h3>
                <div className="admin__table-wrap">
                  <table className="admin__table">
                    <thead>
                      <tr>
                        <th>Preview</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Added</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {photos.map((photo) => (
                        <tr key={photo.id}>
                          <td>
                            <img
                              src={getInitialPhotoUrl(photo.url, photo.category, photo.title)}
                              alt={photo.title}
                              className="admin__table-thumb"
                              referrerPolicy="no-referrer"
                            />
                          </td>
                          <td>
                            <div>{photo.title}</div>
                            {isLikelyWebpage(photo.url) && (
                              <span
                                className="admin__badge admin__badge--warning"
                                style={{ marginTop: "4px" }}
                              >
                                ⚠️ Webpage URL
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="admin__badge">{photo.category}</span>
                          </td>
                          <td>
                            {new Date(photo.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="admin__table-actions">
                              {isLikelyWebpage(photo.url) && (
                                <button
                                  className="admin__btn--quickfix"
                                  onClick={() => handleQuickFixUrl(photo)}
                                  title="Replace with verified direct image link"
                                >
                                  ⚡ Fix Link
                                </button>
                              )}
                              <button
                                className="admin__btn admin__btn--sm admin__btn--edit"
                                onClick={() => handleEditPhoto(photo)}
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                className="admin__btn admin__btn--sm admin__btn--delete"
                                onClick={() => handleDeletePhoto(photo.id)}
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── USERS TAB ─── */}
          {activeTab === "users" && (
            <div className="admin__users">
              <div className="admin__table-card">
                <h3 className="admin__section-title">
                  Registered Users ({users.length})
                </h3>
                <div className="admin__table-wrap">
                  <table className="admin__table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>{u.email}</td>
                          <td>
                            <span
                              className={`admin__badge ${
                                u.role === "admin"
                                  ? "admin__badge--admin"
                                  : "admin__badge--user"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td>
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
