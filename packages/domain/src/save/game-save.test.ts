import { describe, expect, it } from "vitest";
import {
  createCharacter,
  INITIAL_BACKPACK_CAPACITY,
} from "../character/character";
import { createGameSave, SAVE_SCHEMA_VERSION } from "./game-save";

const character = createCharacter({
  id: "hero-1",
  name: "Eira",
  locationId: "starter-village",
  skills: [
    {
      category: "combat",
      id: "constitution",
      initialLevel: 10,
      name: "Constitution",
    },
  ],
});

describe("Character and GameSave", () => {
  it("creates a new character with 10 backpack slots and no experience", () => {
    expect(character.backpack.capacity).toBe(INITIAL_BACKPACK_CAPACITY);
    expect(character.skills).toEqual({ constitution: 1222 });
    expect(character.currentHitpoints).toBe(10);
  });

  it("creates a versioned save with unlimited bank storage", () => {
    const save = createGameSave({
      id: "save-1",
      contentVersion: "0.1.0",
      lastSimulatedAt: 1_790_000_000_000,
      randomState: 12345,
      character,
    });

    expect(save.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(save.character).toBe(character);
    expect(save.bank).toEqual({ items: {} });
    expect(save.lastSimulatedAt).toBe(1_790_000_000_000);
    expect(save.randomState).toBe(12345);
    expect(JSON.parse(JSON.stringify(save))).toEqual(save);
  });

  it("rejects invalid save metadata", () => {
    const input = {
      id: "save-1",
      contentVersion: "0.1.0",
      lastSimulatedAt: 1_790_000_000_000,
      randomState: 0,
      character,
    };
    expect(() =>
      createGameSave({ ...input, randomState: 0x1_0000_0000 }),
    ).toThrow(RangeError);
    expect(() => createGameSave({ ...input, lastSimulatedAt: -1 })).toThrow(
      RangeError,
    );
    expect(() =>
      createCharacter({
        id: "hero-2",
        name: " ",
        locationId: "starter-village",
        skills: [],
      }),
    ).toThrow(RangeError);
  });
});
