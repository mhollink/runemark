import AccountBalance from "@mui/icons-material/AccountBalance";
import AutoStories from "@mui/icons-material/AutoStories";
import Backpack from "@mui/icons-material/Backpack";
import Favorite from "@mui/icons-material/Favorite";
import Map from "@mui/icons-material/Map";
import SportsMartialArts from "@mui/icons-material/SportsMartialArts";
import {
  Alert,
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Paper,
  Stack,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import { gameContent } from "@runemark/content";
import { maxHitpointsForCharacter } from "@runemark/domain";
import { useState } from "react";
import { OfflineSummary } from "./game/OfflineSummary";
import { useGame } from "./game/use-game";
import { ActiveActivity } from "./layout/ActiveActivity";
import { BankPage, InventoryPage } from "./pages/ResourcesPage";
import { SkillsPage } from "./pages/SkillsPage";
import { WorldPage } from "./pages/WorldPage";

const navigation = [
  { id: "skills", label: "Skills", icon: SportsMartialArts },
  { id: "world", label: "World", icon: Map },
  { id: "inventory", label: "Inventory", icon: Backpack },
  { id: "bank", label: "Bank", icon: AccountBalance },
  { id: "journal", label: "Journal", icon: AutoStories },
] as const;
type Page = (typeof navigation)[number]["id"];

export default function App() {
  const {
    game,
    offlineReport,
    loadError,
    storageError,
    startActivity,
    stopActivity,
    dismissOfflineReport,
    resetSave,
  } = useGame();
  const [page, setPage] = useState<Page>("skills");
  const [selectedSkillId, setSelectedSkillId] = useState(
    gameContent.skills.woodcutting?.id ??
      Object.values(gameContent.skills)[0]?.id ??
      "",
  );

  if (!game)
    return (
      <Stack spacing={2} sx={{ maxWidth: 560, mx: "auto", p: 3 }}>
        <Typography variant="h4">Unable to load Runemark</Typography>
        <Alert severity="error">{loadError}</Alert>
        <Typography>Your existing save has not been overwritten.</Typography>
        {storageError && <Alert severity="error">{storageError}</Alert>}
        <Button variant="contained" onClick={resetSave}>
          Start a new game
        </Button>
      </Stack>
    );

  const node =
    gameContent.locations[game.character.nodeId] ??
    gameContent.sites[game.character.nodeId];
  const region = node ? gameContent.regions[node.regionId] : undefined;
  return (
    <Box
      sx={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <AppBar
        position="static"
        color="transparent"
        sx={{
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <Box
            component="img"
            src="/favicon.png"
            alt=""
            sx={{ width: 36, height: 36, objectFit: "contain" }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ letterSpacing: 2, fontWeight: 800 }}>
              RUNEMARK
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              A Norse-inspired idle RPG
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right", minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600}>
              {node?.name ?? game.character.nodeId}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {region?.name ?? "Unknown region"}
            </Typography>
          </Box>
          <Stack
            direction="row"
            alignItems="center"
            gap={0.75}
            sx={{ ml: { xs: 0, sm: 2 } }}
          >
            <Favorite color="error" fontSize="small" />
            <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
              {game.character.currentHitpoints}/
              {maxHitpointsForCharacter(game.character)}
            </Typography>
          </Stack>
        </Toolbar>
        <Tabs
          value={page}
          onChange={(_, value: Page) => setPage(value)}
          aria-label="Main navigation"
          sx={{ display: { xs: "none", sm: "flex" }, px: 2 }}
        >
          {navigation.map(({ id, label, icon: Icon }) => (
            <Tab
              key={id}
              value={id}
              label={label}
              icon={<Icon fontSize="small" />}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </AppBar>
      {storageError && <Alert severity="warning">{storageError}</Alert>}
      <Box
        sx={{
          order: { xs: 2, sm: 0 },
          px: { xs: 1, sm: 2 },
          pt: { xs: 0, sm: 2 },
          pb: { xs: 1, sm: 0 },
          flexShrink: 0,
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
          <ActiveActivity game={game} onStop={stopActivity} />
        </Box>
      </Box>
      <Box
        component="main"
        sx={{
          order: 1,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          p: { xs: 1.5, sm: 2 },
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
          {page === "skills" && (
            <SkillsPage
              game={game}
              selectedSkillId={selectedSkillId}
              onSelect={setSelectedSkillId}
              onStart={startActivity}
            />
          )}
          {page === "world" && (
            <WorldPage game={game} onStart={startActivity} />
          )}
          {page === "inventory" && <InventoryPage game={game} />}
          {page === "bank" && <BankPage game={game} />}
          {page === "journal" && (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h4">Journal</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Quests and achievements are planned for a later release.
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
      <BottomNavigation
        showLabels
        value={page}
        onChange={(_, value: Page) => setPage(value)}
        sx={{
          order: 3,
          display: { xs: "flex", sm: "none" },
          borderTop: 1,
          borderColor: "divider",
          height: "auto",
          minHeight: 56,
          pb: "env(safe-area-inset-bottom)",
        }}
      >
        {navigation.map(({ id, label, icon: Icon }) => (
          <BottomNavigationAction
            key={id}
            value={id}
            label={label}
            icon={<Icon />}
            sx={{ minWidth: 0, px: 0.5 }}
          />
        ))}
      </BottomNavigation>
      {offlineReport && (
        <OfflineSummary
          report={offlineReport}
          onDismiss={dismissOfflineReport}
        />
      )}
    </Box>
  );
}
