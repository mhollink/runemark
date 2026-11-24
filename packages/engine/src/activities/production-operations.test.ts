import { gameContent } from "@runemark/content";
import {
  createInventory,
  type ProductionActivityDefinition,
} from "@runemark/domain";
import { describe, expect, it } from "vitest";
import { tryProduce, withdrawProductionBatch } from "./production-operations";

const recipe: ProductionActivityDefinition = {
  id: "test-recipe",
  kind: "production",
  name: "Test recipe",
  skillId: "cooking",
  durationMs: 1_000,
  experiencePerAction: 1,
  inputs: [{ itemId: "raw-herring", quantity: 1 }],
  outputs: [{ itemId: "cooked-herring", quantity: 2 }],
};

describe("production operations", () => {
  it("limits the batch by output capacity as well as input capacity", () => {
    const bank = { items: { "raw-herring": 10 } };
    const batch = withdrawProductionBatch(bank, 5, recipe, gameContent);
    expect(batch.actions).toBe(2);
    expect(batch.bank.items["raw-herring"]).toBe(8);
    expect(bank.items["raw-herring"]).toBe(10);
  });

  it("does not consume an inventory without enough ingredients", () => {
    const inventory = createInventory(5);
    expect(tryProduce(inventory, recipe, gameContent)).toBeNull();
    expect(inventory.slots).toEqual([]);
  });
});
