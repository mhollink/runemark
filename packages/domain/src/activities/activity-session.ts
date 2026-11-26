import type { CombatProgress } from "../combat/combat-progress";
import type { TravelLeg } from "../world/travel-route";

export type ActivityPhase =
  | "working"
  | "travel-to-bank"
  | "banking"
  | "travel-to-activity";

export interface TravelProgress {
  readonly legs: readonly TravelLeg[];
  readonly index: number;
}

export interface ActivitySession {
  readonly nodeId: string;
  readonly activityId: string;
  readonly status: "running" | "blocked";
  readonly phase: ActivityPhase;
  readonly elapsedMs: number;
  readonly travel: TravelProgress | null;
  readonly combat?: CombatProgress | undefined;
}
