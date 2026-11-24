import type { GameContent } from "@runemark/content";
import type {
  ActivityDefinition,
  ActivitySiteDefinition,
} from "@runemark/domain";

export interface ResolvedActivity {
  readonly site: ActivitySiteDefinition;
  readonly activity: ActivityDefinition;
}

export function resolveActivity(
  content: GameContent,
  siteId: string,
  activityId: string,
): ResolvedActivity {
  const site = content.sites[siteId];
  const activity = content.activities[activityId];
  if (!site) throw new Error(`Unknown site: ${siteId}`);
  if (!activity) throw new Error(`Unknown activity: ${activityId}`);
  if (!site.activityIds.includes(activity.id))
    throw new Error(`Activity ${activity.id} is not available at ${site.id}`);
  assertValidActivity(activity);
  return { site, activity };
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
    (activity.inputs.length === 0 || activity.outputs.length === 0)
  ) {
    throw new RangeError(`Invalid production recipe: ${activity.id}`);
  }
}
