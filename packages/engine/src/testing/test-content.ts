import type { GameContent } from "@runemark/content";
import type {
  GatheringActivityDefinition,
  ItemDefinition,
  ProductionActivityDefinition,
} from "@runemark/domain";

function item(id: string, stackable = false): ItemDefinition {
  return { id, name: id, stackable };
}

export const chopBirch = {
  id: "chop-birch",
  name: "Chop Birch",
  kind: "gathering",
  skillId: "woodcutting",
  durationMs: 5_000,
  experiencePerAction: 4,
  rewards: { kind: "fixed", drops: [{ itemId: "birch-log", quantity: 1 }] },
} satisfies GatheringActivityDefinition;

export const mineCopper = {
  id: "mine-copper",
  name: "Mine Copper",
  kind: "gathering",
  skillId: "mining",
  durationMs: 7_500,
  experiencePerAction: 6,
  rewards: {
    kind: "all",
    rewards: [
      { kind: "table", tableId: "test-gems" },
      { kind: "fixed", drops: [{ itemId: "copper-ore", quantity: 1 }] },
    ],
  },
} satisfies GatheringActivityDefinition;

const catchHerring = {
  id: "catch-herring",
  name: "Catch Herring",
  kind: "gathering",
  skillId: "fishing",
  durationMs: 10_000,
  experiencePerAction: 8,
  rewards: { kind: "fixed", drops: [{ itemId: "raw-herring", quantity: 1 }] },
} satisfies GatheringActivityDefinition;

const cookHerring = {
  id: "cook-herring",
  name: "Cook Herring",
  kind: "production",
  skillId: "cooking",
  durationMs: 8_000,
  experiencePerAction: 7,
  requiredFacility: ["hearth"],
  inputs: [{ itemId: "raw-herring", quantity: 1 }],
  outputs: [{ itemId: "cooked-herring", quantity: 1 }],
} satisfies ProductionActivityDefinition;

// Synthetic world for engine tests, independent of production content.
export const testContent: GameContent = {
  version: "test-content-v1",
  items: {
    "birch-log": item("birch-log"),
    "copper-ore": item("copper-ore"),
    "uncut-ruby": item("uncut-ruby"),
    "raw-herring": item("raw-herring"),
    "cooked-herring": item("cooked-herring"),
    bones: item("bones"),
    feather: item("feather", true),
  },
  activities: {
    "chop-birch": chopBirch,
    "mine-copper": mineCopper,
    "catch-herring": catchHerring,
    "cook-herring": cookHerring,
    "fight-chicken": {
      id: "fight-chicken",
      name: "Fight Chicken",
      kind: "combat",
      monsterId: "test-chicken",
    },
  },
  monsters: {
    "test-chicken": {
      id: "test-chicken",
      name: "Test Chicken",
      combat: {
        maxHitpoints: 3,
        attackType: "melee",
        attackIntervalMs: 4_000,
        maxHit: 1,
        accuracy: 0,
        defense: { melee: 0, ranged: 0, magic: 0 },
      },
      loot: { kind: "fixed", drops: [{ itemId: "bones", quantity: 1 }] },
    },
  },
  regions: { "test-region": { id: "test-region", name: "Test Region" } },
  locations: {
    "test-town": {
      id: "test-town",
      name: "Test Town",
      regionId: "test-region",
      facilities: ["bank", "hearth"],
    },
    "test-village": {
      id: "test-village",
      name: "Test Village",
      regionId: "test-region",
      facilities: [],
    },
  },
  sites: {
    "test-forest": {
      id: "test-forest",
      name: "Test Forest",
      regionId: "test-region",
      activityIds: ["chop-birch"],
    },
    "test-mine": {
      id: "test-mine",
      name: "Test Mine",
      regionId: "test-region",
      activityIds: ["mine-copper"],
    },
    "test-shore": {
      id: "test-shore",
      name: "Test Shore",
      regionId: "test-region",
      activityIds: ["catch-herring"],
    },
    "test-farm": {
      id: "test-farm",
      name: "Test Farm",
      regionId: "test-region",
      activityIds: ["fight-chicken"],
    },
  },
  routes: {
    "forest-route": {
      id: "forest-route",
      fromId: "test-town",
      toId: "test-forest",
      durationMs: 5_000,
    },
    "mine-route": {
      id: "mine-route",
      fromId: "test-town",
      toId: "test-mine",
      durationMs: 15_000,
    },
    "shore-route": {
      id: "shore-route",
      fromId: "test-town",
      toId: "test-shore",
      durationMs: 8_000,
    },
    "farm-route": {
      id: "farm-route",
      fromId: "test-town",
      toId: "test-farm",
      durationMs: 4_000,
    },
    "village-route": {
      id: "village-route",
      fromId: "test-forest",
      toId: "test-village",
      durationMs: 3_000,
    },
  },
  lootTables: {
    "test-gems": {
      id: "test-gems",
      kind: "conditional",
      oneIn: 4,
      success: {
        kind: "fixed",
        drops: [{ itemId: "uncut-ruby", quantity: 1 }],
      },
      failure: { kind: "nothing" },
    },
  },
  skills: {
    attack: { id: "attack", name: "Attack", category: "combat" },
    strength: { id: "strength", name: "Strength", category: "combat" },
    defense: { id: "defense", name: "Defense", category: "combat" },
    constitution: {
      id: "constitution",
      name: "Constitution",
      category: "combat",
      initialLevel: 10,
    },
    woodcutting: {
      id: "woodcutting",
      name: "Woodcutting",
      category: "gathering",
    },
    mining: { id: "mining", name: "Mining", category: "gathering" },
    fishing: { id: "fishing", name: "Fishing", category: "gathering" },
    cooking: { id: "cooking", name: "Cooking", category: "production" },
  },
};
