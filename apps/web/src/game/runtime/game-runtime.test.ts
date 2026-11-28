import type { GameSave } from "@runemark/domain";
import type { GameCommand } from "@runemark/engine";
import { describe, expect, it, vi } from "vitest";
import { testContent } from "@/test/fixtures/test-content";
import { createTestGame, TEST_TIMESTAMP } from "@/test/fixtures/test-game";
import { createSimulationResult } from "@/test/fixtures/test-simulation";
import { createInMemorySaveRepository } from "../persistence/in-memory-save-repository";
import { createSaveManager } from "../persistence/save-manager";
import { createGameRuntime } from "./game-runtime";

function setup(initialValue?: unknown) {
  const repository = createInMemorySaveRepository(initialValue);

  const saveManager = createSaveManager(repository, testContent);

  const now = vi.fn(() => TEST_TIMESTAMP + 60_000);

  const createInitialGame = vi.fn(
    (): GameSave => ({
      ...createTestGame(),
      id: "new-save",
      lastSimulatedAt: now(),
    }),
  );

  const advance = vi.fn((game: GameSave, until: number) =>
    createSimulationResult({
      ...game,
      lastSimulatedAt: until,
    }),
  );

  const execute = vi.fn((game: GameSave, _command: GameCommand, at: number) =>
    createSimulationResult({
      ...game,
      lastSimulatedAt: at,
    }),
  );

  const runtime = createGameRuntime({
    now,
    advance,
    execute,
    createInitialGame,
    saveManager,
  });

  return {
    runtime,
    store: runtime.store,
    repository,
    saveManager,
    now,
    advance,
    execute,
    createInitialGame,
  };
}

describe("Game runtime initialization", () => {
  it("starts in a loading state", () => {
    const { store } = setup();

    expect(store.getState().status).toBe("loading");
    expect(store.getState().game).toBeNull();
  });

  it("creates and persists a new game when storage is empty", async () => {
    const { runtime, store, saveManager, createInitialGame } = setup();

    await runtime.initialize();

    const state = store.getState();

    expect(state.status).toBe("ready");
    expect(state.game?.id).toBe("new-save");
    expect(createInitialGame).toHaveBeenCalledTimes(1);

    await expect(saveManager.load()).resolves.toEqual(state.game);
  });

  it("restores and advances an existing save", async () => {
    const game = createTestGame();

    const { runtime, store, advance, createInitialGame } = setup(game);

    await runtime.initialize();

    expect(createInitialGame).not.toHaveBeenCalled();

    expect(advance).toHaveBeenCalledExactlyOnceWith(
      game,
      TEST_TIMESTAMP + 60_000,
    );

    expect(store.getState().game?.id).toBe(game.id);

    expect(store.getState().game?.lastSimulatedAt).toBe(
      TEST_TIMESTAMP + 60_000,
    );
  });

  it("initializes only once", async () => {
    const { runtime, createInitialGame } = setup();

    const first = runtime.initialize();
    const second = runtime.initialize();

    expect(first).toBe(second);

    await Promise.all([first, second]);

    expect(createInitialGame).toHaveBeenCalledTimes(1);
  });

  it("does not overwrite an invalid save", async () => {
    const invalid = { schemaVersion: 999 };

    const { runtime, store, repository, createInitialGame } = setup(invalid);

    await runtime.initialize();

    expect(store.getState().status).toBe("error");
    expect(store.getState().game).toBeNull();
    expect(createInitialGame).not.toHaveBeenCalled();

    await expect(repository.load()).resolves.toEqual(invalid);
  });

  it("continues in memory after an initial save failure", async () => {
    const { runtime, store, saveManager } = setup();

    vi.spyOn(saveManager, "save").mockRejectedValueOnce(
      new Error("Storage unavailable"),
    );

    await runtime.initialize();

    expect(store.getState().status).toBe("ready");

    expect(store.getState().storageError).toBe("Storage unavailable");
  });
});

describe("Game runtime simulation", () => {
  it("does not simulate before initialization", () => {
    const { runtime, advance } = setup();

    runtime.tick();

    expect(advance).not.toHaveBeenCalled();
  });

  it("advances the game on a tick", async () => {
    const { runtime, store, now } = setup();

    await runtime.initialize();

    now.mockReturnValue(TEST_TIMESTAMP + 61_000);

    runtime.tick();

    expect(store.getState().game?.lastSimulatedAt).toBe(
      TEST_TIMESTAMP + 61_000,
    );
  });

  it("does not simulate backwards", async () => {
    const { runtime, store, now, advance } = setup();

    await runtime.initialize();

    const game = store.getState().game;

    now.mockReturnValue(TEST_TIMESTAMP);

    runtime.tick();

    expect(advance).not.toHaveBeenCalled();
    expect(store.getState().game).toBe(game);
  });

  it("stops simulation after an engine failure", async () => {
    const { runtime, store, advance, now } = setup();

    await runtime.initialize();

    const game = store.getState().game;

    now.mockReturnValue(TEST_TIMESTAMP + 61_000);

    advance.mockImplementationOnce(() => {
      throw new Error("Simulation failed");
    });

    runtime.tick();

    expect(store.getState().game).toBe(game);
    expect(store.getState().status).toBe("error");
    expect(store.getState().runtimeError).toBe("Simulation failed");

    runtime.tick();

    expect(advance).toHaveBeenCalledTimes(1);
  });

  it("generates an offline report when resuming", async () => {
    const { runtime, store, now, advance, saveManager } = setup();

    await runtime.initialize();

    now.mockReturnValue(TEST_TIMESTAMP + 120_000);

    advance.mockImplementationOnce((game, until) =>
      createSimulationResult(
        {
          ...game,
          lastSimulatedAt: until,
        },
        {
          completedActions: 10,
          coinsGained: 25,
        },
      ),
    );

    runtime.resume();

    expect(store.getState().offlineReport).toMatchObject({
      elapsedMs: 60_000,
      summary: {
        completedActions: 10,
        coinsGained: 25,
      },
    });

    await saveManager.flush();
  });
});

describe("Game runtime persistence", () => {
  it("persists the latest game snapshot", async () => {
    const { runtime, store, now, saveManager } = setup();

    await runtime.initialize();

    now.mockReturnValue(TEST_TIMESTAMP + 61_000);

    runtime.tick();

    await runtime.save();

    await expect(saveManager.load()).resolves.toEqual(store.getState().game);
  });

  it("requests a save after a successful command", async () => {
    const { runtime, store, saveManager, now } = setup();

    await runtime.initialize();

    const save = vi.spyOn(saveManager, "save");

    now.mockReturnValue(TEST_TIMESTAMP + 61_000);

    store.getState().stopActivity();

    await saveManager.flush();

    expect(save).toHaveBeenCalledTimes(1);

    await expect(saveManager.load()).resolves.toEqual(store.getState().game);
  });

  it("does not save after a failed command", async () => {
    const { runtime, store, execute, saveManager } = setup();

    await runtime.initialize();

    const save = vi.spyOn(saveManager, "save");

    execute.mockImplementationOnce(() => {
      throw new Error("Invalid command");
    });

    store.getState().stopActivity();

    expect(save).not.toHaveBeenCalled();

    expect(store.getState().commandError).toBe("Invalid command");
  });

  it("clears storage errors after successful persistence", async () => {
    const { runtime, store, saveManager } = setup();

    await runtime.initialize();

    vi.spyOn(saveManager, "save").mockRejectedValueOnce(
      new Error("Storage unavailable"),
    );

    await runtime.save();

    expect(store.getState().storageError).toBe("Storage unavailable");

    await runtime.save();

    expect(store.getState().storageError).toBeNull();
  });

  it("persists a new character when resetting", async () => {
    const { runtime, store, saveManager } = setup(createTestGame());

    await runtime.initialize();

    await runtime.reset();

    expect(store.getState().game?.id).toBe("new-save");
    expect(store.getState().status).toBe("ready");
    expect(store.getState().offlineReport).toBeNull();

    await expect(saveManager.load()).resolves.toEqual(store.getState().game);
  });

  it("preserves the existing save if resetting fails", async () => {
    const { runtime, store, saveManager } = setup(createTestGame());

    await runtime.initialize();

    const previous = store.getState().game;

    vi.spyOn(saveManager, "save").mockRejectedValueOnce(
      new Error("Storage unavailable"),
    );

    await runtime.reset();

    expect(store.getState().game).toBe(previous);
    expect(store.getState().status).toBe("error");

    await expect(saveManager.load()).resolves.toEqual(previous);
  });
});
