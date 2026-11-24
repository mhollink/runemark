import type { GameContent } from "@runemark/content";
import {
  addInventoryItem,
  type BankStorage,
  countBankItem,
  countInventoryItem,
  createInventory,
  InsufficientItemsError,
  type Inventory,
  InventoryCapacityError,
  type ProductionActivityDefinition,
  removeInventoryItem,
  withdrawBankItem,
} from "@runemark/domain";

export function hasIngredients(
  inventory: Inventory,
  activity: ProductionActivityDefinition,
): boolean {
  return activity.inputs.every(
    ({ itemId, quantity }) => countInventoryItem(inventory, itemId) >= quantity,
  );
}

export function hasBankIngredients(
  bank: BankStorage,
  activity: ProductionActivityDefinition,
): boolean {
  return activity.inputs.every(
    ({ itemId, quantity }) => countBankItem(bank, itemId) >= quantity,
  );
}

function getItem(content: GameContent, itemId: string) {
  const item = content.items[itemId];

  if (!item) {
    throw new Error(`Unknown production item: ${itemId}`);
  }

  return item;
}

export function tryProduce(
  inventory: Inventory,
  activity: ProductionActivityDefinition,
  content: GameContent,
): Inventory | null {
  try {
    let backpack = inventory;

    for (const input of activity.inputs) {
      backpack = removeInventoryItem(backpack, input.itemId, input.quantity);
    }

    for (const output of activity.outputs) {
      backpack = addInventoryItem(
        backpack,
        getItem(content, output.itemId),
        output.quantity,
      );
    }

    return backpack;
  } catch (error) {
    if (
      error instanceof InsufficientItemsError ||
      error instanceof InventoryCapacityError
    ) {
      return null;
    }

    throw error;
  }
}

export function withdrawProductionBatch(
  bank: BankStorage,
  capacity: number,
  activity: ProductionActivityDefinition,
  content: GameContent,
): {
  bank: BankStorage;
  backpack: Inventory;
  actions: number;
} {
  let result = {
    bank,
    backpack: createInventory(capacity),
    actions: 0,
  };

  // Limit each batch to at most one action per backpack slot.
  // This also keeps batches finite for stackable ingredients.
  for (let actions = 1; actions <= capacity; actions++) {
    if (!hasBankIngredients(result.bank, activity)) {
      break;
    }

    let nextBank = result.bank;
    let nextBackpack = result.backpack;

    try {
      for (const input of activity.inputs) {
        nextBackpack = addInventoryItem(
          nextBackpack,
          getItem(content, input.itemId),
          input.quantity,
        );

        nextBank = withdrawBankItem(nextBank, input.itemId, input.quantity);
      }
    } catch (error) {
      if (
        error instanceof InventoryCapacityError ||
        error instanceof InsufficientItemsError
      ) {
        break;
      }

      throw error;
    }

    // Verify that the entire batch can be processed,
    // including recipes that produce multiple outputs.
    let simulated: Inventory | null = nextBackpack;

    for (let index = 0; index < actions; index++) {
      simulated = tryProduce(simulated, activity, content);

      if (simulated === null) {
        break;
      }
    }

    if (simulated === null) {
      break;
    }

    result = {
      bank: nextBank,
      backpack: nextBackpack,
      actions,
    };
  }

  return result;
}
