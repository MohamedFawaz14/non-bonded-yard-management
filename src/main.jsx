import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// Tailwind CSS is loaded via CDN (add to index.html):
// <script src="https://cdn.tailwindcss.com"></script>
// Remove App.css import if using Tailwind exclusively
// import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);