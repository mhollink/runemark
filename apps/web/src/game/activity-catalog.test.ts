import { gameContent } from "@runemark/content";
import { createSkillProgress } from "@runemark/domain";
import { describe, expect, it } from "vitest";
import {
  activityCatalog,
  activityOptionsForSkill,
  groupActivityOptions,
  unmetRequirements,
} from "./activity-catalog";
import { regionalGraphNodes } from "./world-layout";

describe("activity catalog", () => {
  it("groups repeated activities without dropping their locations", () => {
    const groups = groupActivityOptions(activityCatalog);
    expect(groups.flat()).toHaveLength(activityCatalog.length);
    expect(new Set(groups.map((group) => group[0]?.activity.id)).size).toBe(
      groups.length,
    );
    for (const group of groups) {
      expect(new Set(group.map(({ activity }) => activity.id)).size).toBe(1);
    }
  });

  it("filters non-combat activities to the selected skill", () => {
    const options = activityOptionsForSkill(
      activityCatalog,
      "woodcutting",
      "gathering",
    );
    expect(options.length).toBeGreaterThan(0);
    expect(
      options.every(
        ({ activity }) =>
          activity.kind !== "combat" && activity.skillId === "woodcutting",
      ),
    ).toBe(true);
  });

  it("finds requirements not met by the starting character", () => {
    const progress = createSkillProgress(Object.values(gameContent.skills));
    expect(
      unmetRequirements(
        {
          id: "test",
          name: "Test",
          kind: "combat",
          monsterId: "test",
          requirements: [{ skillId: "woodcutting", level: 99 }],
        },
        progress,
      ),
    ).toEqual([{ skillId: "woodcutting", level: 99 }]);
  });
});

describe("Goldvale map", () => {
  it("has a presentation coordinate for every defined regional node", () => {
    const nodes = [
      ...Object.values(gameContent.locations),
      ...Object.values(gameContent.sites),
    ].filter(({ regionId }) => regionId === "goldvale");
    const graph = regionalGraphNodes("goldvale");
    expect(nodes.length).toBeGreaterThan(0);
    expect(graph?.map(({ id }) => id).sort()).toEqual(
      nodes.map(({ id }) => id).sort(),
    );
  });
});
