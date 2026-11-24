import type { GameContent } from "@runemark/content";
import type {
  ActivityDefinition,
  ActivitySession,
  Character,
  GameSave,
} from "@runemark/domain";
import { tryProduce } from "../activities/production-operations";
import { transitionToTravel } from "../activities/shared/activity-session";
import { resolveActivity } from "../activities/shared/resolve-activity";
import { findNearestBank, findShortestRoute } from "../navigation/find-route";
import { simulateGame } from "../simulation";
import type { GameCommand, SimulationResult } from "../simulation-types";

export function executeGameCommand(
  state: GameSave,
  content: GameContent,
  command: GameCommand,
  at: number,
): SimulationResult {
  const result = simulateGame(state, content, at);
  switch (command.type) {
    case "STOP_ACTIVITY":
      return updateActivity(result, null);
    case "START_ACTIVITY":
      return updateActivity(
        result,
        createActivitySession(
          result.state.character,
          content,
          command.siteId,
          command.activityId,
        ),
      );
  }
}

function updateActivity(
  result: SimulationResult,
  session: ActivitySession | null,
): SimulationResult {
  return { ...result, state: { ...result.state, activeActivity: session } };
}

function createActivitySession(
  character: Character,
  content: GameContent,
  siteId: string,
  activityId: string,
): ActivitySession {
  const { site, activity } = resolveActivity(content, siteId, activityId);
  const requiresBank = requiresBankBeforeActivity(character, activity, content);
  const route = requiresBank
    ? findNearestBank(content, character.nodeId)
    : findShortestRoute(content, character.nodeId, site.id);
  if (route === null) throw new Error(`No accessible route for ${site.id}`);
  const session: ActivitySession = {
    siteId: site.id,
    activityId: activity.id,
    status: "running",
    phase: "working",
    elapsedMs: 0,
    travel: null,
  };
  return transitionToTravel(
    session,
    requiresBank ? "travel-to-bank" : "travel-to-site",
    route,
  );
}

function requiresBankBeforeActivity(
  character: Character,
  activity: ActivityDefinition,
  content: GameContent,
): boolean {
  switch (activity.kind) {
    case "gathering":
      return false;
    case "production":
      return tryProduce(character.backpack, activity, content) === null;
    case "combat":
      return character.currentHitpoints === 0;
  }
}
