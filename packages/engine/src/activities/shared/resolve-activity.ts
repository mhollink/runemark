import type { GameContent } from "@runemark/content";
import type { ActivityDefinition, WorldNodeDefinition } from "@runemark/domain";

export interface ResolvedActivity {
  readonly node: WorldNodeDefinition;
  readonly activity: ActivityDefinition;
}

export function isActivityAvailableAtNode(
  content: GameContent,
  nodeId: string,
  activity: ActivityDefinition,
): boolean {
  if (activity.kind === "production") {
    const location = content.locations[nodeId];
    return (
      location !== undefined &&
      activity.requiredFacility.length > 0 &&
      activity.requiredFacility.every((facility) =>
        location.facilities?.includes(facility),
      )
    );
  }

  return content.sites[nodeId]?.activityIds.includes(activity.id) ?? false;
}

export function resolveActivity(
  content: GameContent,
  nodeId: string,
  activityId: string,
): ResolvedActivity {
  const node = content.locations[nodeId] ?? content.sites[nodeId];
  const activity = content.activities[activityId];
  if (!node) throw new Error(`Unknown node: ${nodeId}`);
  if (!activity) throw new Error(`Unknown activity: ${activityId}`);
  assertValidActivity(activity);
  if (!isActivityAvailableAtNode(content, nodeId, activity)) {
    throw new Error(`Activity ${activity.id} is not available at ${nodeId}`);
  }
  return { node, activity };
}

function assertValidActivity(activity: ActivityDefinition): void {
  if (activity.kind === "combat") return;
  if (
    !Number.isSafeInteger(activity.durationMs) ||
    activity.durationMs <= 0 ||
    !Number.isSafeInteger(activity.experiencePerAction) ||
    activity.experiencePerAction <= 0
  ) {
    throw new RangeError(`Invalid activity: ${activity.id}`);
  }
  if (
    activity.kind === "production" &&
    (activity.inputs.length === 0 ||
      activity.outputs.length === 0 ||
      activity.requiredFacility.length === 0)
  ) {
    throw new RangeError(`Invalid production recipe: ${activity.id}`);
  }
}
