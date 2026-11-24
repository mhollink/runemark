import type {
  GameEvent,
  SimulationResult,
  SimulationSummary,
} from "@runemark/engine";

export const MIN_OFFLINE_DURATION_MS = 30_000;

export interface OfflineReport {
  readonly elapsedMs: number;
  readonly summary: SimulationSummary;
  readonly events: readonly GameEvent[];
}

export function createOfflineReport(
  result: SimulationResult,
  elapsedMs: number,
): OfflineReport | null {
  if (elapsedMs < MIN_OFFLINE_DURATION_MS) return null;

  const { summary, events } = result;

  const hasProgress =
    summary.completedActions > 0 || summary.bankTrips > 0 || events.length > 0;

  if (!hasProgress) return null;

  return { elapsedMs, summary, events };
}
