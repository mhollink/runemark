import type { ActivityRuntime } from "./activity-runtime";

export function remainingSimulationTime(runtime: ActivityRuntime): number {
  return runtime.until - runtime.cursor;
}

export function advancePhaseTime(
  runtime: ActivityRuntime,
  durationMs: number,
): boolean {
  const elapsedMs = runtime.session.elapsedMs;
  if (!Number.isSafeInteger(durationMs) || durationMs <= 0) {
    throw new RangeError("Invalid phase duration");
  }
  if (
    !Number.isSafeInteger(elapsedMs) ||
    elapsedMs < 0 ||
    elapsedMs >= durationMs
  ) {
    throw new RangeError("Invalid phase progress");
  }
  const consumedMs = Math.min(
    remainingSimulationTime(runtime),
    durationMs - elapsedMs,
  );
  runtime.cursor += consumedMs;
  const nextElapsedMs = elapsedMs + consumedMs;
  const completed = nextElapsedMs === durationMs;
  runtime.session = {
    ...runtime.session,
    elapsedMs: completed ? 0 : nextElapsedMs,
  };
  return completed;
}
