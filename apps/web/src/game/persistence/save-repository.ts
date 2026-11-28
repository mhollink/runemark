import type { GameSave } from "@runemark/domain";

export interface GameSaveRepository {
  load(): Promise<unknown>;
  save(game: GameSave): Promise<void>;
  remove(): Promise<void>;
}
