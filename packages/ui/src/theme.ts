import { createTheme } from "@mui/material/styles";

export const runemarkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#7ea8db" },
    success: { main: "#83ba91" },
    warning: { main: "#d5ac70" },
    error: { main: "#d48080" },
    background: { default: "#111720", paper: "#1c2531" },
    text: { primary: "#e5edf7", secondary: "#a4b1c2" },
    divider: "#344151",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 650 },
    h6: { fontWeight: 650 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 6, borderRadius: 6 },
        bar: { borderRadius: 6 },
      },
    },
  },
});
