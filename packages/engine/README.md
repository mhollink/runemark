# @runemark/engine

A deterministic, stateless simulation API. The engine imports production data from
`@runemark/content` in its **public entry point**, then calls an internal pure
`simulateGame(state, content, until)` function so tests can supply fixtures.

## Initial slice

- `advanceGame(state, until)` advances absolute Unix time in milliseconds.
- `executeCommand(state, command, at)` first advances existing work to `at`,
  then starts or stops the single selected activity.
- The first supported activity kind is **gathering**. Fixed-time completions are
  batched, without emitting one event for each individual item.
- The `SimulationSummary` counts completed actions, rewards and skill experience.
  `ACTIVITY_BLOCKED` is emitted when the backpack cannot hold another reward.
- Partial action progress is stored in the save. Calling the engine in chunks or
  once should produce identical **game state**.

## Not yet implemented

Travel, automated banking, tools, skill requirements, production, combat, random
rewards, and quests. Resource timings and XP values are provisional. The sample
activities are initially accessible in `starter-village`; no travel is needed.

## Example

```ts
import { gameContent } from "@runemark/content";
import { createCharacter, createGameSave } from "@runemark/domain";
import { advanceGame, executeCommand } from "@runemark/engine";

const at = Date.now();
const save = createGameSave({
  id: "save-1",
  contentVersion: gameContent.version,
  lastSimulatedAt: at,
  randomState: 1,
  character: createCharacter({
    id: "hero-1",
    name: "Eira",
    locationId: "starter-village",
    startingHitpoints: 10,
  }),
});
const started = executeCommand(
  save,
  { type: "START_ACTIVITY", activityId: "chop-birch" },
  at,
);
const result = advanceGame(started.state, at + 12_000);
// 2 logs, 10 Woodcutting XP, 2 seconds toward the next log.
```
