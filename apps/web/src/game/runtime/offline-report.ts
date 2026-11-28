import type {
  GameEvent,
  SimulationResult,
  SimulationSummary,
} from "@runemark/engine";
import { MIN_OFFLINE_DURATION_MS } from "./runtime-config";

export interface OfflineReport {
  readonly elapsedMs: number;
  readonly summary: SimulationSummary;
  readonly events: readonly GameEvent[];
}

export function createOfflineReport(
  result: SimulationResult,
  elapsedMs: number,
): OfflineReport | null {
  if (elapsedMs < MIN_OFFLINE_DURATION_MS) {
    return null;
  }

  if (!hasProgress(result)) {
    return null;
  }

  return {
    elapsedMs,
    summary: result.summary,
    events: result.events,
  };
}

function hasProgress(result: SimulationResult): boolean {
  const { summary, events } = result;

  return (
    summary.completedActions > 0 ||
    summary.bankTrips > 0 ||
    summary.coinsGained > 0 ||
    Object.values(summary.itemsGained).some((quantity) => quantity > 0) ||
    Object.values(summary.itemsConsumed).some((quantity) => quantity > 0) ||
    Object.values(summary.itemsBanked).some((quantity) => quantity > 0) ||
    Object.values(summary.experienceGained).some((exp) => exp > 0) ||
    events.length > 0
  );
}
