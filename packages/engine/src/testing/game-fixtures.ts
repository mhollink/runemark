import type { GameContent } from "@runemark/content";
import {
  createCharacter,
  createGameSave,
  createInventory,
  type GameSave,
} from "@runemark/domain";
import { executeGameCommand } from "../commands/execute-command";
import { simulateGame } from "../simulation";
import type { GameCommand } from "../simulation-types";
import { testContent } from "./test-content";

export const START = 1_790_000_000_000;

export function createTestGame(content = testContent): GameSave {
  const character = createCharacter({
    id: "test-character",
    name: "Eira",
    locationId: "test-town",
    skills: Object.values(content.skills),
  });
  return createGameSave({
    id: "test-save",
    contentVersion: content.version,
    lastSimulatedAt: START,
    randomState: 42,
    character: { ...character, backpack: createInventory(10) },
  });
}

export function advanceTestGame(
  state: GameSave,
  until: number,
  content: GameContent = testContent,
) {
  return simulateGame(state, content, until);
}

export function executeTestCommand(
  state: GameSave,
  command: GameCommand,
  at: number,
  content: GameContent = testContent,
) {
  return executeGameCommand(state, content, command, at);
}

export function startTestActivity(
  nodeId: string,
  activityId: string,
  state = createTestGame(),
  content: GameContent = testContent,
): GameSave {
  return executeTestCommand(
    state,
    { type: "START_ACTIVITY", nodeId, activityId },
    state.lastSimulatedAt,
    content,
  ).state;
}
