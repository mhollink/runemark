import { CssBaseline, ThemeProvider } from "@mui/material";
import { runemarkTheme } from "@runemark/ui";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

const root = document.getElementById("root");
if (!root)
  throw new Error("Unable to bootstrap react, root element is missing.");

createRoot(root).render(
  <StrictMode>
    <ThemeProvider theme={runemarkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
