// HtmlToJsxExample.jsx
// Standalone demo file showing plain HTML converted into JSX syntax.
// Drop this into src/components/ and use it like: <HtmlToJsxExample />

import React from "react";

/* ------------------------------------------------------------------
   ORIGINAL HTML (what you might start with in a static mockup):

   <div class="card">
     <img src="photo.jpg" alt="Mountain view">
     <h3>Misty Mountains</h3>
     <p>Category: <b>nature</b></p>
     <button onclick="toggleFavorite()">♥ Favorite</button>
     <!-- a comment -->
     <input type="text" placeholder="Search..." disabled>
     <label for="search">Search photos</label>
   </div>

   KEY CONVERSION RULES APPLIED BELOW:
   1. class          -> className
   2. for            -> htmlFor
   3. onclick="..."  -> onClick={jsFunction}
   4. Unclosed tags (<img>, <input>) -> self-closing (<img />, <input />)
   5. <!-- comment --> -> {/* comment */}
   6. Inline "style" strings -> JS objects: style={{ key: "value" }}
   7. Any {} inserts real JavaScript expressions/variables into markup
------------------------------------------------------------------- */

function HtmlToJsxExample() {
  const title = "Misty Mountains";
  const category = "nature";
  const isFavorite = true;

  const toggleFavorite = () => {
    console.log("Favorite toggled for:", title);
  };

  const cardStyle = {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "12px",
    maxWidth: "280px",
  };

  return (
    <div className="card" style={cardStyle}>
      <img src="photo.jpg" alt="Mountain view" />

      <h3>{title}</h3>

      <p>
        Category: <b>{category}</b>
      </p>

      <button onClick={toggleFavorite}>
        {isFavorite ? "♥ Favorited" : "♡ Favorite"}
      </button>

      {/* a comment, written the JSX way */}

      <input type="text" placeholder="Search..." disabled />

      <label htmlFor="search">Search photos</label>
    </div>
  );
}

export default HtmlToJsxExample;
