import type { TravelLeg } from "../world/travel-route";

export type ActivityPhase =
  | "working"
  | "travel-to-bank"
  | "banking"
  | "travel-to-site";

export interface TravelProgress {
  readonly legs: readonly TravelLeg[];
  readonly index: number;
}

export interface ActivitySession {
  readonly siteId: string;
  readonly status: "running" | "blocked";
  readonly phase: ActivityPhase;
  readonly elapsedMs: number;
  readonly travel: TravelProgress | null;
}
