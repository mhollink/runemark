import { LinearProgress, Stack, Typography } from "@mui/material";
import {
  experienceUntilNextLevel,
  levelForExperience,
  progressTowardsNextLevel,
} from "@runemark/domain";

interface SkillProgressProps {
  readonly name: string;
  readonly experience: number;
  readonly compact?: boolean;
  readonly color?: "primary" | "success" | "warning" | "error";
}

export function SkillProgress({
  name,
  experience,
  compact = false,
  color = "primary",
}: SkillProgressProps) {
  const remaining = experienceUntilNextLevel(experience);
  return (
    <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap={1}
      >
        <Typography variant={compact ? "body2" : "h5"} noWrap>
          {name}
        </Typography>
        <Typography
          variant={compact ? "body2" : "h6"}
          color={`${color}.main`}
          sx={{ whiteSpace: "nowrap" }}
        >
          {compact
            ? levelForExperience(experience)
            : `Level ${levelForExperience(experience)}`}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        color={color}
        value={progressTowardsNextLevel(experience) * 100}
        aria-label={`${name} level progress`}
      />
      {!compact && (
        <Typography variant="body2" color="text.secondary">
          {experience.toLocaleString()} XP ·{" "}
          {remaining === null
            ? "Maximum level"
            : `${remaining.toLocaleString()} XP to next level`}
        </Typography>
      )}
    </Stack>
  );
}
