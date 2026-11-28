import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { LuBackpack, LuCoins, LuHeart } from "react-icons/lu";
import {
  selectBackpackCapacity,
  selectCoins,
  selectHitpoints,
  selectMaxHitpoints,
  selectUsedBackpackSlots,
  useGameStore,
} from "@/game";

export function GameStorePreview() {
  const hp = useGameStore(selectHitpoints);
  const maxHp = useGameStore(selectMaxHitpoints);
  const usedSlots = useGameStore(selectUsedBackpackSlots);
  const capacity = useGameStore(selectBackpackCapacity);
  const coins = useGameStore(selectCoins);

  return (
    <Stack direction="row" spacing={20}>
      <Stack sx={{ alignItems: "center" }} spacing={1}>
        <Box sx={{ color: "error.main" }}>
          <LuHeart size={28} />
        </Box>

        <Typography>
          {hp}/{maxHp}
        </Typography>

        <Typography variant="caption" color="textSecondary">
          Hitpoints
        </Typography>
      </Stack>

      <Stack sx={{ alignItems: "center" }} spacing={1}>
        <Box sx={{ color: "primary.main" }}>
          <LuBackpack size={28} />
        </Box>

        <Typography>
          {usedSlots}/{capacity}
        </Typography>

        <Typography variant="caption" color="textSecondary">
          Backpack
        </Typography>
      </Stack>

      <Stack sx={{ alignItems: "center" }} spacing={1}>
        <Box sx={{ color: "warning.main" }}>
          <LuCoins size={28} />
        </Box>

        <Typography>{coins?.toLocaleString()}</Typography>

        <Typography variant="caption" color="textSecondary">
          Coins
        </Typography>
      </Stack>
    </Stack>
  );
}
