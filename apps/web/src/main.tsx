import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";

const root = document.getElementById("root");

if (!root) {
    throw new Error("Unable to bootstrap react, root element is missing.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
