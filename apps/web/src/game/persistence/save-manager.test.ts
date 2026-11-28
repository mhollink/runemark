import type { GameSave } from "@runemark/domain";
import { describe, expect, it, vi } from "vitest";
import { testContent } from "@/test/fixtures/test-content";
import { createTestGame } from "@/test/fixtures/test-game";
import { createInMemorySaveRepository } from "./in-memory-save-repository";
import { createSaveManager } from "./save-manager";

function setup(initialValue?: unknown) {
  const repository = createInMemorySaveRepository(initialValue);

  const manager = createSaveManager(repository, testContent);

  return { repository, manager };
}

describe("Save manager", () => {
  it("returns null when no save exists", async () => {
    const { manager } = setup();

    await expect(manager.load()).resolves.toBeNull();
  });

  it("loads an existing save", async () => {
    const game = createTestGame();
    const { manager } = setup(game);

    await expect(manager.load()).resolves.toEqual(game);
  });

  it("persists a game", async () => {
    const { manager } = setup();
    const game = createTestGame();

    await manager.save(game);

    await expect(manager.load()).resolves.toEqual(game);
  });

  it("rejects invalid saved data", async () => {
    const { manager } = setup({
      schemaVersion: 1,
    });

    await expect(manager.load()).rejects.toThrow(
      "The saved game is invalid or incompatible.",
    );
  });

  it("rejects null as invalid saved data", async () => {
    const { manager } = setup(null);

    await expect(manager.load()).rejects.toThrow();
  });

  it("does not overwrite invalid saved data", async () => {
    const invalid = { schemaVersion: 999 };
    const { manager, repository } = setup(invalid);

    await expect(manager.load()).rejects.toThrow();

    await expect(repository.load()).resolves.toEqual(invalid);
  });

  it("propagates storage read failures", async () => {
    const { repository } = setup();

    const manager = createSaveManager(
      {
        ...repository,
        load: vi.fn().mockRejectedValue(new Error("Storage unavailable")),
      },
      testContent,
    );

    await expect(manager.load()).rejects.toThrow("Storage unavailable");
  });

  it("removes a saved game", async () => {
    const { manager } = setup(createTestGame());

    await manager.remove();

    await expect(manager.load()).resolves.toBeNull();
  });

  it("serializes concurrent save requests", async () => {
    const { repository } = setup();

    const save = vi.fn(repository.save);

    const manager = createSaveManager({ ...repository, save }, testContent);

    const first = createTestGame();

    const second: GameSave = {
      ...first,
      lastSimulatedAt: first.lastSimulatedAt + 1_000,
    };

    await Promise.all([manager.save(first), manager.save(second)]);

    expect(save).toHaveBeenNthCalledWith(1, first);
    expect(save).toHaveBeenNthCalledWith(2, second);

    await expect(manager.load()).resolves.toEqual(second);
  });

  it("waits for a pending write to finish", async () => {
    const { repository } = setup();

    let release = () => {};

    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });

    const save = vi.fn(async () => {
      await pending;
    });

    const manager = createSaveManager({ ...repository, save }, testContent);

    const first = manager.save(createTestGame());
    const second = manager.save(createTestGame());

    await Promise.resolve();

    expect(save).toHaveBeenCalledTimes(1);

    release();

    await Promise.all([first, second]);

    expect(save).toHaveBeenCalledTimes(2);
  });

  it("continues after a failed save", async () => {
    const { repository } = setup();

    const save = vi
      .fn(repository.save)
      .mockRejectedValueOnce(new Error("Storage unavailable"));

    const manager = createSaveManager({ ...repository, save }, testContent);

    const game = createTestGame();

    await expect(manager.save(game)).rejects.toThrow();

    await expect(manager.save(game)).resolves.toBeUndefined();

    await expect(manager.load()).resolves.toEqual(game);
  });

  it("serializes removal after pending writes", async () => {
    const { manager } = setup();

    await Promise.all([manager.save(createTestGame()), manager.remove()]);

    await expect(manager.load()).resolves.toBeNull();
  });

  it("loads the latest queued save", async () => {
    const { manager } = setup();
    const game = createTestGame();

    const saving = manager.save(game);
    const loading = manager.load();

    await saving;
    await expect(loading).resolves.toEqual(game);
  });
});
