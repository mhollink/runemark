const UINT32_RANGE = 0x1_0000_0000;

export interface RandomRoll {
  readonly value: number;
  readonly randomState: number;
}

/** Deterministic PRNG with persisted unsigned 32-bit state. */
export function nextRandom(randomState: number): RandomRoll {
  if (
    !Number.isSafeInteger(randomState) ||
    randomState < 0 ||
    randomState >= UINT32_RANGE
  ) {
    throw new RangeError("Invalid random state");
  }

  const next = (Math.imul(1_664_525, randomState) + 1_013_904_223) >>> 0;

  return {
    value: next / UINT32_RANGE,
    randomState: next,
  };
}
