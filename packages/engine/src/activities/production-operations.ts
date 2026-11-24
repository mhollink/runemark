import type { GameContent } from "@runemark/content";
import {
  type BankStorage,
  countBankItem,
  createInventory,
  InsufficientItemsError,
  type Inventory,
  InventoryCapacityError,
  type ProductionActivityDefinition,
  removeInventoryItem,
  withdrawBankItem,
} from "@runemark/domain";
import { addItemQuantity } from "../loot/store-loot";

export function hasBankIngredients(
  bank: BankStorage,
  activity: ProductionActivityDefinition,
): boolean {
  return activity.inputs.every(
    ({ itemId, quantity }) => countBankItem(bank, itemId) >= quantity,
  );
}

export function tryProduce(
  inventory: Inventory,
  activity: ProductionActivityDefinition,
  content: GameContent,
): Inventory | null {
  try {
    const consumed = activity.inputs.reduce(
      (current, input) =>
        removeInventoryItem(current, input.itemId, input.quantity),
      inventory,
    );
    return activity.outputs.reduce(
      (current, output) => addItemQuantity(current, content, output),
      consumed,
    );
  } catch (error) {
    if (isExpectedProductionFailure(error)) return null;
    throw error;
  }
}

function isExpectedProductionFailure(error: unknown): boolean {
  return (
    error instanceof InsufficientItemsError ||
    error instanceof InventoryCapacityError
  );
}

export interface ProductionBatch {
  readonly bank: BankStorage;
  readonly backpack: Inventory;
  readonly actions: number;
}

export function withdrawProductionBatch(
  bank: BankStorage,
  capacity: number,
  activity: ProductionActivityDefinition,
  content: GameContent,
): ProductionBatch {
  let batch: ProductionBatch = {
    bank,
    backpack: createInventory(capacity),
    actions: 0,
  };
  // Keep batches finite even for fully stackable recipes.
  while (batch.actions < capacity) {
    const candidate = withdrawNextAction(batch, activity, content);
    if (candidate === null || !canProcessBatch(candidate, activity, content))
      break;
    batch = candidate;
  }
  return batch;
}

function withdrawNextAction(
  batch: ProductionBatch,
  activity: ProductionActivityDefinition,
  content: GameContent,
): ProductionBatch | null {
  if (!hasBankIngredients(batch.bank, activity)) return null;
  try {
    let { bank, backpack } = batch;
    for (const input of activity.inputs) {
      backpack = addItemQuantity(backpack, content, input);
      bank = withdrawBankItem(bank, input.itemId, input.quantity);
    }
    return { bank, backpack, actions: batch.actions + 1 };
  } catch (error) {
    if (isExpectedProductionFailure(error)) return null;
    throw error;
  }
}

function canProcessBatch(
  batch: ProductionBatch,
  activity: ProductionActivityDefinition,
  content: GameContent,
): boolean {
  let inventory = batch.backpack;
  for (let action = 0; action < batch.actions; action++) {
    const produced = tryProduce(inventory, activity, content);
    if (produced === null) return false;
    inventory = produced;
  }
  return true;
}
