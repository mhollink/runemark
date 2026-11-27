import { type GameContent, gameContent } from "@runemark/content";
import {
  type ActivityDefinition,
  levelForSkill,
  type SkillProgress,
  type WorldNodeDefinition,
} from "@runemark/domain";
import { isActivityAvailableAtNode } from "@runemark/engine";

export interface ActivityOption {
  readonly node: WorldNodeDefinition;
  readonly activity: ActivityDefinition;
}

export function buildActivityCatalog(
  content: GameContent,
): readonly ActivityOption[] {
  const activities = Object.values(content.activities);
  return [
    ...Object.values(content.locations),
    ...Object.values(content.sites),
  ].flatMap((node) =>
    activities
      .filter((activity) =>
        isActivityAvailableAtNode(content, node.id, activity),
      )
      .map((activity) => ({ node, activity })),
  );
}

// Content is static; don't rebuild the catalog on every simulation tick.
export const activityCatalog = buildActivityCatalog(gameContent);

export function activityOptionsForSkill(
  catalog: readonly ActivityOption[],
  skillId: string,
  category: string,
): readonly ActivityOption[] {
  return catalog.filter(({ activity }) =>
    activity.kind === "combat"
      ? category === "combat"
      : activity.skillId === skillId,
  );
}

export function groupActivityOptions(
  options: readonly ActivityOption[],
): readonly (readonly ActivityOption[])[] {
  const groups = new Map<string, ActivityOption[]>();
  for (const option of options) {
    const group = groups.get(option.activity.id) ?? [];
    group.push(option);
    groups.set(option.activity.id, group);
  }
  return [...groups.values()].sort((a, b) => {
    const first = a[0]?.activity;
    const second = b[0]?.activity;
    const level = (activity: ActivityDefinition | undefined) =>
      Math.max(
        1,
        ...(activity?.requirements?.map((requirement) => requirement.level) ??
          []),
      );
    return (
      level(first) - level(second) ||
      (first?.name ?? "").localeCompare(second?.name ?? "")
    );
  });
}

export function unmetRequirements(
  activity: ActivityDefinition,
  progress: SkillProgress,
) {
  return (activity.requirements ?? []).filter(
    ({ skillId, level }) => levelForSkill(progress, skillId) < level,
  );
}

export function displayName(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatDuration(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / 1000);
  return seconds < 60
    ? `${seconds}s`
    : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
