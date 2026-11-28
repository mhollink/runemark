import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { GameStorePreview } from "@/app/GameStorePreview.tsx";
import { RunemarkLogo } from "@/app/RunemarkLogo.tsx";

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
        <Box sx={{ color: "primary.main", display: "flex" }}>
          <RunemarkLogo size={124} />
        </Box>

        <Typography variant="h4" sx={{ letterSpacing: 4 }}>
          RUNEMARK
        </Typography>

        <Typography color="textSecondary">A Norse-inspired idle RPG</Typography>

        <GameStorePreview />

        <Typography variant="caption" color="textSecondary">
          Early development
        </Typography>
      </Stack>
    </Box>
  );
}
