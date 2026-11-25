import type { GameContent } from "@runemark/content";
import type { ActivityRuntime } from "../activities/shared/activity-runtime";
import { phaseAfterTravel } from "../activities/shared/activity-session";
import { advancePhaseTime } from "../activities/shared/activity-time";

export function locationForNode(content: GameContent, nodeId: string): string {
  const locationId = content.locations[nodeId]?.id;
  if (locationId === undefined) {
    throw new Error(`Unknown travel node: ${nodeId}`);
  }
  return locationId;
}

export function advanceTravel(runtime: ActivityRuntime): void {
  const { phase, travel } = runtime.session;
  if (phase !== "travel-to-bank" && phase !== "travel-to-site") {
    throw new Error("Activity is not traveling");
  }
  const leg = travel?.legs[travel.index];
  if (!travel || !leg || leg.fromId !== runtime.character.nodeId) {
    throw new Error("Invalid travel progress");
  }
  if (!advancePhaseTime(runtime, leg.durationMs)) return;
  arriveAtNode(runtime, leg.toId);
  const nextIndex = travel.index + 1;
  runtime.session =
    nextIndex < travel.legs.length
      ? { ...runtime.session, travel: { ...travel, index: nextIndex } }
      : { ...runtime.session, phase: phaseAfterTravel(phase), travel: null };
}

function arriveAtNode(runtime: ActivityRuntime, nodeId: string): void {
  runtime.character = {
    ...runtime.character,
    nodeId,
    locationId: locationForNode(runtime.content, nodeId),
  };
}
