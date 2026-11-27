import ExpandMore from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  List,
  ListItemButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { gameContent } from "@runemark/content";
import { experienceForSkill, type GameSave } from "@runemark/domain";
import { SkillProgress } from "@runemark/ui";
import {
  activityCatalog,
  activityOptionsForSkill,
} from "../game/activity-catalog";
import { categoryColor, skillCategories, skillIcon } from "../game/skill-ui";
import { ActivityList } from "./ActivityList";

interface Props {
  readonly game: GameSave;
  readonly selectedSkillId: string;
  readonly onSelect: (id: string) => void;
  readonly onStart: (nodeId: string, activityId: string) => void;
}
const skills = Object.values(gameContent.skills);

export function SkillsPage({
  game,
  selectedSkillId,
  onSelect,
  onStart,
}: Props) {
  const skill = gameContent.skills[selectedSkillId];
  if (!skill) return <Typography>No skills defined.</Typography>;
  const regionId = (
    gameContent.locations[game.character.nodeId] ??
    gameContent.sites[game.character.nodeId] ??
    gameContent.locations[game.character.locationId]
  )?.regionId;
  const options = activityOptionsForSkill(
    activityCatalog,
    skill.id,
    skill.category,
  ).filter(({ node }) => node.regionId === regionId);
  const Icon = skillIcon(skill.id);
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          md: "250px minmax(0, 1fr)",
        },
        gap: 2,
        alignItems: "start",
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          position: "sticky",
          top: 0,
          maxHeight: "100%",
          overflowY: "auto",
        }}
      >
        {skillCategories.map((category) => {
          const group = skills.filter(
            (entry) => entry.category === category.id,
          );
          if (!group.length) return null;
          return (
            <Accordion
              key={category.id}
              defaultExpanded={skill.category === category.id}
              disableGutters
              sx={{
                mb: 1,
                border: 1,
                borderColor: "divider",
                "&::before": { display: "none" },
                borderRadius: 1,
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography
                  variant="subtitle2"
                  color={`${category.color}.main`}
                >
                  {category.name}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List disablePadding>
                  {group.map((entry) => {
                    const SkillIcon = skillIcon(entry.id);
                    return (
                      <ListItemButton
                        key={entry.id}
                        selected={entry.id === skill.id}
                        onClick={() => onSelect(entry.id)}
                        sx={{ gap: 1.5, py: 1.25 }}
                      >
                        <SkillIcon fontSize="small" color={category.color} />
                        <SkillProgress
                          compact
                          name={entry.name}
                          experience={experienceForSkill(
                            game.character.skills,
                            entry.id,
                          )}
                          color={category.color}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
      <TextField
        select
        label="Select skill"
        value={skill.id}
        onChange={(event) => onSelect(event.target.value)}
        sx={{ display: { xs: "block", md: "none" } }}
      >
        {skills.map((entry) => (
          <MenuItem key={entry.id} value={entry.id}>
            {entry.name} ·{" "}
            {skillCategories.find(({ id }) => id === entry.category)?.name}
          </MenuItem>
        ))}
      </TextField>
      <Stack spacing={2} sx={{ minWidth: 0 }}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Stack direction="row" sx={{alignItems: "center", gap: 2}}>
            <Icon color={categoryColor(skill.category)} sx={{ fontSize: 44 }} />
            <SkillProgress
              name={skill.name}
              experience={experienceForSkill(game.character.skills, skill.id)}
              color={categoryColor(skill.category)}
            />
          </Stack>
        </Paper>
        <Typography variant="h6">
          {skill.category === "combat" ? "Combat encounters" : "Activities"}
        </Typography>
        {skill.category === "combat" && (
          <Typography variant="body2" color="text.secondary">
            Combat encounters are shared across combat skill pages. Experience
            awards are determined by the engine.
          </Typography>
        )}
        <ActivityList
          key={skill.id}
          game={game}
          options={options}
          onStart={onStart}
        />
      </Stack>
    </Box>
  );
}
