import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { createTestGame } from "@/test/fixtures/test-game";
import { createIndexedDbSaveRepository } from "./indexed-db-save-repository";

const databaseName = "runemark-test";

const repository = createIndexedDbSaveRepository(databaseName);

describe("IndexedDB save repository", () => {
  beforeEach(async () => {
    await repository.remove();
  });

  it("returns undefined when no save exists", async () => {
    await expect(repository.load()).resolves.toBeUndefined();
  });

  it("persists a game", async () => {
    const game = createTestGame();

    await repository.save(game);

    await expect(repository.load()).resolves.toEqual(game);
  });

  it("replaces an existing game", async () => {
    const game = createTestGame();

    const updated = {
      ...game,
      character: {
        ...game.character,
        coins: 250,
      },
    };

    await repository.save(game);
    await repository.save(updated);

    await expect(repository.load()).resolves.toEqual(updated);
  });

  it("removes an existing game", async () => {
    await repository.save(createTestGame());
    await repository.remove();

    await expect(repository.load()).resolves.toBeUndefined();
  });

  it("loads data through another repository instance", async () => {
    const game = createTestGame();

    await repository.save(game);

    const other = createIndexedDbSaveRepository(databaseName);

    await expect(other.load()).resolves.toEqual(game);
  });
});
