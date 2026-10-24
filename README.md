# Photo Gallery App (React)

A small but complete React app that demonstrates the core building blocks of
a React project. Below is a map from each concept to where it lives in the
code, plus setup steps.

## 1. Project setup with Create React App

This project is laid out exactly as `create-react-app` generates it. To
create it from scratch yourself:

```bash
npx create-react-app photo-gallery-app
cd photo-gallery-app
npm install react-router-dom
npm start
```

To run **this** project: unzip it, then from inside the folder:

```bash
npm install
npm start
```

It opens at `http://localhost:3000`.

## 2. JSX syntax & HTML-to-JSX conversion

Every `.js` file under `src/components` is JSX: HTML-like markup embedded in
JavaScript. A few conversion rules to notice (see `PhotoCard.js`,
`Navbar.js`):

| Plain HTML | JSX |
|---|---|
| `class="card"` | `className="card"` |
| `<img src="..." >` (unclosed) | `<img src="..." />` (self-closed) |
| `onclick="..."` | `onClick={...}` (camelCase, JS function) |
| `style="color:red;"` | `style={{ color: "red" }}` (JS object) |
| `<!-- comment -->` | `{/* comment */}` |

Example — this raw HTML:

```html
<div class="card">
  <img src="photo.jpg">
  <button onclick="toggleFavorite()">♥</button>
</div>
```

becomes this JSX (from `PhotoCard.js`):

```jsx
<div className={styles.card}>
  <img src={photo.url} alt={photo.title} />
  <button onClick={() => onToggleFavorite(photo.id)}>♥</button>
</div>
```

## 3. Reusable functional components

- `Navbar.js` — same nav on every page.
- `PhotoCard.js` — one component, rendered once per photo, driven entirely
  by props (`photo`, `isFavorite`, `onToggleFavorite`). Reused inside both
  `Gallery.js` and `Favorites.js`.

## 4. JS variables & array operations (map / filter)

- `src/data/photos.js` — a plain JS array of photo objects (the "data").
- `Gallery.js`:
  - `photos.map(...)` builds the list of unique category filter buttons.
  - `photos.filter(...)` derives the visible photo list from the selected
    category (state).
  - `visiblePhotos.map(...)` renders one `<PhotoCard>` per photo.
- `Favorites.js` uses `.filter()` to pull out only the photos whose ids are
  in the favorites list.

## 5. State management with hooks

- `useState` — `Gallery.js` tracks `selectedCategory` for filtering.
- `useState` + `useEffect` — `src/hooks/useFavorites.js` is a **custom hook**
  that stores favorited photo ids and persists them to `localStorage`
  whenever they change.
- State is **lifted up** to `App.js` and passed down as props, so the
  Gallery grid and the Favorites page always stay in sync.

## 6. Routing for gallery navigation

Set up in `App.js` using `react-router-dom`:

- `/` → `Gallery` (grid + category filter)
- `/favorites` → `Favorites` (only favorited photos)
- `/photo/:id` → `PhotoDetail` (single photo, read via `useParams`)

`Navbar.js` uses `<NavLink>` for the top nav; `PhotoCard.js` uses `<Link>`
to jump into detail view; `PhotoDetail.js` uses `useNavigate` for a "Back"
button.

## 7. Multiple styling techniques

- **Global CSS** — `src/styles/index.css` (reset/base styles).
- **Plain CSS files** — `App.css`, `Navbar.css` (layout, flexbox, gradients).
- **CSS Modules** (scoped class names, no collisions) — `Gallery.module.css`,
  `PhotoCard.module.css`, `PhotoDetail.module.css`, imported as
  `import styles from "./X.module.css"` and used as `styles.card`.
- **Inline styles** — in `PhotoCard.js`, the heart icon's color/scale is
  computed at render time from `isFavorite` and passed as a JS object via
  `style={{ ... }}`.
- **Responsive design** — CSS Grid with `auto-fill`/`minmax()` in
  `Gallery.module.css` so the grid reflows without media queries, plus
  explicit `@media` breakpoints in `Navbar.css`, `App.css`, and
  `PhotoDetail.module.css` for layout changes on small screens.

## Project structure

```
photo-gallery-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── PhotoCard.js
│   │   ├── Gallery.js
│   │   ├── Favorites.js
│   │   └── PhotoDetail.js
│   ├── data/
│   │   └── photos.js
│   ├── hooks/
│   │   └── useFavorites.js
│   ├── styles/
│   │   ├── index.css
│   │   ├── App.css
│   │   ├── Navbar.css
│   │   ├── Gallery.module.css
│   │   ├── PhotoCard.module.css
│   │   └── PhotoDetail.module.css
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## Ideas to extend it

- Add a search-by-title text input (another `.filter()` on `photos`).
- Add a photo-upload form that appends to the array with `useState`.
- Add pagination or infinite scroll to the grid.
- Swap `localStorage` favorites for a backend API.
