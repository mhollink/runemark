import { assertNonNegativeSafeInteger } from "../shared/validation";
import type { Character } from "./character";

export function addCoins(character: Character, amount: number): Character {
  assertNonNegativeSafeInteger(amount, "Amount");

  const coins = character.coins + amount;
  assertNonNegativeSafeInteger(coins, "Coins");

  return amount === 0 ? character : { ...character, coins };
}

export function hasEnoughCoins(character: Character, amount: number): boolean {
  assertNonNegativeSafeInteger(amount, "Amount");

  return character.coins >= amount;
}

export function removeCoins(character: Character, amount: number): Character {
  if (!hasEnoughCoins(character, amount)) {
    throw new RangeError("Insufficient coins");
  }

  return amount === 0
    ? character
    : {
        ...character,
        coins: character.coins - amount,
      };
}
