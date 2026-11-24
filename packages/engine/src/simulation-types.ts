import type { GameSave } from "@runemark/domain";

export interface SimulationSummary {
  readonly completedActions: number;
  readonly itemsGained: Readonly<Record<string, number>>;
  readonly itemsConsumed: Readonly<Record<string, number>>;
  readonly experienceGained: Readonly<Record<string, number>>;
  readonly bankTrips: number;
  readonly itemsBanked: Readonly<Record<string, number>>;
}

export type GameEvent = {
  readonly type: "ACTIVITY_BLOCKED";
  readonly siteId: string;
  readonly activityId: string;
  readonly timestamp: number;
  readonly reason:
    | "INVENTORY_FULL"
    | "BANK_UNAVAILABLE"
    | "INSUFFICIENT_MATERIALS";
};

export interface SimulationResult {
  readonly state: GameSave;
  readonly events: readonly GameEvent[];
  readonly summary: SimulationSummary;
}

export type GameCommand =
  | { readonly type: "START_ACTIVITY"; readonly siteId: string }
  | { readonly type: "STOP_ACTIVITY" };
