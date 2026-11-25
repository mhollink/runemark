import { goldvalePositions } from "./goldvale";

type Position = readonly [number, number];

export const worldPositions: Readonly<Record<string, Position>> = {
  ...goldvalePositions,
};
