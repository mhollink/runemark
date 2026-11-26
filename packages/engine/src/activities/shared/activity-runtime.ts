import type { GameContent } from "@runemark/content";
import type {
  ActivityDefinition,
  ActivitySession,
  BankStorage,
  Character,
  GameSave,
  WorldNodeDefinition,
} from "@runemark/domain";
import type { GameEvent, SimulationResult } from "../../simulation-types";
import {
  type ActivitySummary,
  createActivitySummary,
} from "./activity-summary";

/** Mutable references local to one invocation; domain objects remain immutable. */
export interface ActivityRuntime<
  T extends ActivityDefinition = ActivityDefinition,
> {
  readonly content: GameContent;
  readonly node: WorldNodeDefinition;
  readonly activity: T;
  readonly until: number;
  cursor: number;
  session: ActivitySession;
  character: Character;
  bank: BankStorage;
  randomState: number;
  readonly summary: ActivitySummary;
  readonly events: GameEvent[];
}

export function createActivityRuntime<T extends ActivityDefinition>(
  state: GameSave,
  content: GameContent,
  node: WorldNodeDefinition,
  activity: T,
  until: number,
): ActivityRuntime<T> {
  const session = state.activeActivity;
  if (
    session?.status !== "running" ||
    session.nodeId !== node.id ||
    session.activityId !== activity.id
  ) {
    throw new Error("No matching active activity session");
  }

  return {
    content,
    node,
    activity,
    until,
    cursor: state.lastSimulatedAt,
    session,
    character: state.character,
    bank: state.bank,
    randomState: state.randomState,
    summary: createActivitySummary(),
    events: [],
  };
}

export function createSimulationResult(
  original: GameSave,
  runtime: ActivityRuntime,
): SimulationResult {
  return {
    state: {
      ...original,
      lastSimulatedAt: runtime.until,
      activeActivity: runtime.session,
      character: runtime.character,
      bank: runtime.bank,
      randomState: runtime.randomState,
    },
    events: runtime.events,
    summary: runtime.summary,
  };
}
