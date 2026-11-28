import { describe, expect, it } from "vitest";
import { createCharacter } from "./character";
import { addCoins, hasEnoughCoins, removeCoins } from "./currency";

function createTestCharacter() {
  return createCharacter({
    id: "test-character",
    name: "Test character",
    locationId: "test-town",
    skills: [],
  });
}

describe("Currency", () => {
  it("starts with zero coins", () => {
    expect(createTestCharacter().coins).toBe(0);
  });

  it("adds coins without mutating the character", () => {
    const character = createTestCharacter();
    const updated = addCoins(character, 25);

    expect(updated.coins).toBe(25);
    expect(character.coins).toBe(0);
  });

  it("removes coins", () => {
    const character = addCoins(createTestCharacter(), 25);

    expect(removeCoins(character, 10).coins).toBe(15);
  });

  it("allows spending the entire balance", () => {
    const character = addCoins(createTestCharacter(), 25);

    expect(removeCoins(character, 25).coins).toBe(0);
  });

  it("determines whether the balance is sufficient", () => {
    const character = addCoins(createTestCharacter(), 25);

    expect(hasEnoughCoins(character, 25)).toBe(true);
    expect(hasEnoughCoins(character, 26)).toBe(false);
  });

  it("rejects spending more coins than available", () => {
    expect(() => removeCoins(createTestCharacter(), 1)).toThrow(RangeError);
  });

  it.each([-1, 0.5, NaN, Infinity])("rejects invalid amount %s", (amount) => {
    const character = createTestCharacter();

    expect(() => addCoins(character, amount)).toThrow(RangeError);

    expect(() => removeCoins(character, amount)).toThrow(RangeError);
  });

  it("rejects currency overflow", () => {
    const character = addCoins(createTestCharacter(), Number.MAX_SAFE_INTEGER);

    expect(() => addCoins(character, 1)).toThrow(RangeError);
  });
});
