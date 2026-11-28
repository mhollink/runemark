import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { LuSwords } from "react-icons/lu";

export function App() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        p: 3,
      }}
    >
      <Stack
        spacing={2}
        sx={{
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Box
          component="img"
          src="/favicon.png"
          alt=""
          sx={{
            width: 96,
            height: 96,
            objectFit: "contain",
          }}
        />

        <Typography variant="h4" sx={{ letterSpacing: 4 }}>
          RUNEMARK
        </Typography>

        <Typography color="textSecondary">A Norse-inspired idle RPG</Typography>

        <Box sx={{ color: "primary.main" }}>
          <LuSwords size={24} aria-hidden />
        </Box>

        <Typography variant="caption" color="textSecondary">
          Early development
        </Typography>
      </Stack>
    </Box>
  );
}
