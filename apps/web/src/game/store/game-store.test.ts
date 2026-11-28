import type { GameSave } from "@runemark/domain";
import type { SimulationResult } from "@runemark/engine";
import { describe, expect, it, vi } from "vitest";
import {
  createGameStore,
  selectCoins,
  selectHitpoints,
  selectMaxHitpoints,
  selectSkillLevel,
  selectUsedBackpackSlots,
} from "@/game";
import { createTestGame, TEST_TIMESTAMP } from "@/test/fixtures/test-game";

function createResult(state: GameSave): SimulationResult {
  return {
    state,
    events: [],
    summary: {
      completedActions: 0,
      coinsGained: 0,
      itemsGained: {},
      itemsConsumed: {},
      experienceGained: {},
      bankTrips: 0,
      itemsBanked: {},
    },
  };
}

function setup() {
  const game = createTestGame();

  const updatedGame: GameSave = {
    ...game,
    lastSimulatedAt: TEST_TIMESTAMP + 1_000,
  };

  const execute = vi.fn(() => createResult(updatedGame));

  const now = vi.fn(() => TEST_TIMESTAMP + 1_000);

  const store = createGameStore({ execute, now }, game);

  return {
    store,
    game,
    updatedGame,
    execute,
    now,
  };
}

describe("Game store", () => {
  it("initializes with the supplied game", () => {
    const { store, game } = setup();

    expect(store.getState().game).toBe(game);
    expect(store.getState().commandError).toBeNull();
  });

  it("supports an uninitialized game", () => {
    const { execute, now } = setup();

    const store = createGameStore({
      execute,
      now,
    });

    expect(store.getState().game).toBeNull();
  });

  it("dispatches a start activity command", () => {
    const { store, game, execute } = setup();

    store.getState().startActivity("test-mine", "mine-copper");

    expect(execute).toHaveBeenCalledExactlyOnceWith(
      game,
      {
        type: "START_ACTIVITY",
        nodeId: "test-mine",
        activityId: "mine-copper",
      },
      TEST_TIMESTAMP + 1_000,
    );
  });

  it("dispatches a stop activity command", () => {
    const { store, game, execute } = setup();

    store.getState().stopActivity();

    expect(execute).toHaveBeenCalledExactlyOnceWith(
      game,
      {
        type: "STOP_ACTIVITY",
      },
      TEST_TIMESTAMP + 1_000,
    );
  });

  it("applies the engine result", () => {
    const { store, updatedGame } = setup();

    store.getState().stopActivity();

    expect(store.getState().game).toBe(updatedGame);
  });

  it("does not execute commands before initialization", () => {
    const { execute, now } = setup();

    const store = createGameStore({
      execute,
      now,
    });

    store.getState().stopActivity();

    expect(execute).not.toHaveBeenCalled();
  });

  it("never executes commands before the last simulated time", () => {
    const { store, execute, now, game } = setup();

    now.mockReturnValue(TEST_TIMESTAMP - 1_000);

    store.getState().stopActivity();

    expect(execute).toHaveBeenCalledExactlyOnceWith(
      game,
      { type: "STOP_ACTIVITY" },
      TEST_TIMESTAMP,
    );
  });

  it("preserves game state when a command fails", () => {
    const { store, game, execute } = setup();

    execute.mockImplementationOnce(() => {
      throw new Error("Invalid activity");
    });

    store.getState().startActivity("unknown-node", "unknown-activity");

    expect(store.getState().game).toBe(game);

    expect(store.getState().commandError).toBe("Invalid activity");
  });

  it("dismisses a command error", () => {
    const { store, execute } = setup();

    execute.mockImplementationOnce(() => {
      throw new Error("Invalid activity");
    });

    store.getState().stopActivity();
    store.getState().dismissCommandError();

    expect(store.getState().commandError).toBeNull();
  });

  it("clears command errors after successful execution", () => {
    const { store, execute } = setup();

    execute.mockImplementationOnce(() => {
      throw new Error("Invalid activity");
    });

    store.getState().stopActivity();
    store.getState().stopActivity();

    expect(store.getState().commandError).toBeNull();
  });

  it("keeps store instances isolated", () => {
    const first = setup();
    const second = setup();

    first.store.getState().stopActivity();

    expect(first.store.getState().game).toBe(first.updatedGame);

    expect(second.store.getState().game).toBe(second.game);
  });
});

describe("Game selectors", () => {
  it("returns the current character statistics", () => {
    const { store } = setup();
    const state = store.getState();

    expect(selectCoins(state)).toBe(0);
    expect(selectHitpoints(state)).toBe(10);
    expect(selectMaxHitpoints(state)).toBe(10);
    expect(selectUsedBackpackSlots(state)).toBe(0);
  });

  it("returns the selected skill level", () => {
    const { store } = setup();
    const state = store.getState();

    expect(selectSkillLevel("constitution")(state)).toBe(10);

    expect(selectSkillLevel("mining")(state)).toBe(1);
  });

  it("returns undefined for uninitialized character statistics", () => {
    const { execute, now } = setup();

    const store = createGameStore({
      execute,
      now,
    });

    expect(selectCoins(store.getState())).toBeUndefined();
  });
});
