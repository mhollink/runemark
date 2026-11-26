import type { ActivityDefinition } from "@runemark/domain";
import { advanceBanking } from "../../logistics/banking";
import { advanceTravel } from "../../navigation/travel";
import type { ActivityRuntime } from "./activity-runtime";
import { travelToActivityNode } from "./activity-session";

export interface ActivityHandler<T extends ActivityDefinition> {
  advanceWork(runtime: ActivityRuntime<T>): void;
  prepareAfterBanking?(runtime: ActivityRuntime<T>): void;
}

export function simulateActivity<T extends ActivityDefinition>(
  runtime: ActivityRuntime<T>,
  handler: ActivityHandler<T>,
): void {
  while (
    runtime.cursor < runtime.until &&
    runtime.session.status === "running"
  ) {
    const previousCursor = runtime.cursor;
    const previousPhase = runtime.session.phase;
    advanceActivityPhase(runtime, handler);
    if (
      runtime.session.status === "running" &&
      runtime.cursor === previousCursor &&
      runtime.session.phase === previousPhase
    ) {
      throw new Error(`Activity made no progress: ${runtime.activity.id}`);
    }
  }
}

function advanceActivityPhase<T extends ActivityDefinition>(
  runtime: ActivityRuntime<T>,
  handler: ActivityHandler<T>,
): void {
  switch (runtime.session.phase) {
    case "travel-to-bank":
    case "travel-to-activity":
      advanceTravel(runtime);
      return;
    case "banking":
      completeBanking(runtime, handler);
      return;
    case "working":
      assertActivityNode(runtime);
      handler.advanceWork(runtime);
      return;
  }
}

function completeBanking<T extends ActivityDefinition>(
  runtime: ActivityRuntime<T>,
  handler: ActivityHandler<T>,
): void {
  if (!advanceBanking(runtime)) return;
  handler.prepareAfterBanking?.(runtime);
  if (runtime.session.status === "running") travelToActivityNode(runtime);
}

function assertActivityNode(runtime: ActivityRuntime): void {
  if (runtime.character.nodeId !== runtime.node.id) {
    throw new Error(`Character is not at node ${runtime.node.id}`);
  }
}
