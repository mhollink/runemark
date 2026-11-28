import type { GameContent } from "@runemark/content";

export const testContent: GameContent = {
  version: "test-content",

  items: {
    "copper-ore": {
      id: "copper-ore",
      name: "Copper ore",
      stackable: false,
    },
  },

  activities: {},
  monsters: {},
  lootTables: {},
  routes: {},
  sites: {},

  regions: {
    "test-region": {
      id: "test-region",
      name: "Test region",
    },
  },

  locations: {
    "test-town": {
      id: "test-town",
      name: "Test town",
      regionId: "test-region",
      facilities: ["bank"],
    },
  },

  skills: {
    constitution: {
      id: "constitution",
      name: "Constitution",
      category: "combat",
      initialLevel: 10,
    },

    mining: {
      id: "mining",
      name: "Mining",
      category: "gathering",
    },
  },
};
