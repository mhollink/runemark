import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import {
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { gameContent } from "@runemark/content";
import type { GameSave } from "@runemark/domain";
import { useState } from "react";

export function InventoryPage({ game }: { readonly game: GameSave }) {
  const { backpack } = game.character;
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Inventory</Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" sx={{justifyContent: "space-between"}}>
            <Typography variant="h6">Backpack</Typography>
            <Typography color="textSecondary">
              {backpack.slots.length}/{backpack.capacity} slots
            </Typography>
          </Stack>
          <LinearProgress
            aria-label="Backpack capacity"
            variant="determinate"
            value={
              backpack.capacity > 0
                ? (100 * backpack.slots.length) / backpack.capacity
                : 0
            }
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: 1,
            }}
          >
            {Array.from({ length: backpack.capacity }, (_, index) => {
              const slot = backpack.slots[index];
              const name = slot
                ? (gameContent.items[slot.itemId]?.name ?? slot.itemId)
                : "Empty slot";
              return (
                <Tooltip
                  key={`slot-${index + 1}`}
                  title={slot ? `${name} × ${slot.quantity}` : name}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      minHeight: 88,
                      p: 1,
                      textAlign: "center",
                      bgcolor: slot ? "action.hover" : "transparent",
                      display: "grid",
                      alignContent: "center",
                      justifyItems: "center",
                    }}
                  >
                    <Inventory2Outlined color={slot ? "primary" : "disabled"} />
                    <Typography
                      variant="caption"
                      sx={{ overflowWrap: "anywhere" }}
                    >
                      {slot ? name : "Empty"}
                    </Typography>
                    {slot && (
                      <Typography variant="caption" sx={{fontWeight :700}}>
                        ×{slot.quantity}
                      </Typography>
                    )}
                  </Paper>
                </Tooltip>
              );
            })}
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}

export function BankPage({ game }: { readonly game: GameSave }) {
  const [search, setSearch] = useState("");
  const items = Object.entries(game.bank.items)
    .map(([id, quantity]) => ({
      id,
      name: gameContent.items[id]?.name ?? id,
      quantity,
    }))
    .filter(({ name }) =>
      name.toLowerCase().includes(search.trim().toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Bank</Typography>
      <TextField
        label="Search bank"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        size="small"
      />
      <Paper variant="outlined">
        {items.length ? (
          <List>
            {items.map(({ id, name, quantity }) => (
              <ListItem key={id} divider>
                <ListItemText primary={name} />
                <Typography sx={{fontWeight: 600    }}>
                  {quantity.toLocaleString()}
                </Typography>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            No matching items.
          </Typography>
        )}
      </Paper>
    </Stack>
  );
}
