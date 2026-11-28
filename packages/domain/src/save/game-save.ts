import type { ActivitySession } from "../activities/activity-session";
import { type BankStorage, createBankStorage } from "../bank/bank";
import type { Character } from "../character/character";
import {
  assertNonEmptyString,
  assertNonNegativeSafeInteger,
} from "../shared/validation";

export const SAVE_SCHEMA_VERSION = 3 as const;

export interface GameSave {
  readonly schemaVersion: typeof SAVE_SCHEMA_VERSION;
  readonly id: string;
  readonly contentVersion: string;
  readonly lastSimulatedAt: number;
  readonly randomState: number;
  readonly character: Character;
  readonly bank: BankStorage;
  readonly activeActivity: ActivitySession | null;
}

export interface NewGameSave {
  readonly id: string;
  readonly contentVersion: string;
  readonly lastSimulatedAt: number;
  readonly randomState: number;
  readonly character: Character;
}

export function createGameSave(input: NewGameSave): GameSave {
  assertNonEmptyString(input.id, "Save ID");
  assertNonEmptyString(input.contentVersion, "Content version");
  assertNonNegativeSafeInteger(
    input.lastSimulatedAt,
    "Last simulated timestamp",
  );
  assertNonNegativeSafeInteger(input.randomState, "Random state");
  if (input.randomState > 0xffffffff) {
    throw new RangeError("Random state must fit in an unsigned 32-bit integer");
  }

  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    id: input.id,
    contentVersion: input.contentVersion,
    lastSimulatedAt: input.lastSimulatedAt,
    randomState: input.randomState,
    character: input.character,
    bank: createBankStorage(),
    activeActivity: null,
  };
}
