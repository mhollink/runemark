import { gameContent } from "@runemark/content";
import type { GameSave } from "@runemark/domain";
import { BANKING_DURATION_MS } from "@runemark/engine";

export function activeActivityPresentation(game: GameSave) {
  const session = game.activeActivity;
  if (!session) return null;
  const activity = gameContent.activities[session.activityId];
  if (!activity) return null;
  const node =
    gameContent.locations[session.nodeId] ?? gameContent.sites[session.nodeId];
  const leg = session.travel?.legs[session.travel.index];
  const traveling =
    session.phase === "travel-to-bank" ||
    session.phase === "travel-to-activity";
  const banking = session.phase === "banking";
  const durationMs = traveling
    ? (leg?.durationMs ?? 0)
    : banking
      ? BANKING_DURATION_MS
      : activity.kind !== "combat"
        ? activity.durationMs
        : 0;
  const phaseLabel =
    session.phase === "travel-to-bank"
      ? "Traveling to bank"
      : session.phase === "travel-to-activity"
        ? "Traveling to activity"
        : banking
          ? "Banking resources"
          : activity.kind === "combat"
            ? "Fighting"
            : activity.kind === "production"
              ? "Producing items"
              : "Gathering resources";
  return {
    activity,
    node,
    leg,
    phaseLabel,
    durationMs,
    progress:
      durationMs > 0
        ? Math.min(100, (100 * session.elapsedMs) / durationMs)
        : 0,
    remainingMs: Math.max(0, durationMs - session.elapsedMs),
    blocked: session.status === "blocked",
    phase: traveling ? "travel" : banking ? "bank" : "work",
    combat: session.combat,
  };
}
