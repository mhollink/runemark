import { describe, expect, it } from "vitest";
import {
  advanceTestGame,
  START,
  startTestActivity,
} from "../../testing/game-fixtures";
import { testContent } from "../../testing/test-content";
import { isActivityAvailableAtNode, resolveActivity } from "./resolve-activity";

describe("activity resolution", () => {
  it("resolves an activity at its registered site", () => {
    const result = resolveActivity(testContent, "test-forest", "chop-birch");
    expect(result.node.id).toBe("test-forest");
    expect(result.activity.id).toBe("chop-birch");
  });

  it("resolves production at a settlement with the required facility", () => {
    const result = resolveActivity(testContent, "test-town", "cook-herring");
    expect(result.node.id).toBe("test-town");
    expect(result.activity.id).toBe("cook-herring");
  });

  it("rejects production at a site or incompatible settlement", () => {
    for (const nodeId of ["test-forest", "test-village"]) {
      expect(() =>
        resolveActivity(testContent, nodeId, "cook-herring"),
      ).toThrow(/not available/);
    }
  });

  it("requires every facility in a production recipe", () => {
    const recipe = testContent.activities["cook-herring"];
    if (recipe?.kind !== "production") throw new Error("Missing recipe");
    const activity = {
      ...recipe,
      requiredFacility: ["hearth", "workshop"] as const,
    };
    expect(isActivityAvailableAtNode(testContent, "test-town", activity)).toBe(
      false,
    );
    const town = testContent.locations["test-town"];
    if (!town) throw new Error("Missing town");
    const content = {
      ...testContent,
      locations: {
        ...testContent.locations,
        "test-town": {
          ...town,
          facilities: ["bank", "hearth", "workshop"] as const,
        },
      },
    };
    expect(isActivityAvailableAtNode(content, "test-town", activity)).toBe(
      true,
    );
  });

  it("rejects gathering at a settlement", () => {
    expect(() =>
      resolveActivity(testContent, "test-town", "chop-birch"),
    ).toThrow(/not available/);
  });

  it("rejects a persisted session for a valid activity at the wrong site", () => {
    const initial = startTestActivity("test-forest", "chop-birch");
    const session = initial.activeActivity;
    if (!session) throw new Error("Missing activity session");
    expect(() =>
      advanceTestGame(
        {
          ...initial,
          activeActivity: { ...session, activityId: "mine-copper" },
        },
        START + 1,
      ),
    ).toThrow(/not available/);
  });
});
