import { describe, expect, it } from "vitest";
import {
  advanceTestGame,
  START,
  startTestActivity,
} from "../../testing/game-fixtures";
import { testContent } from "../../testing/test-content";
import { resolveActivity } from "./resolve-activity";

describe("activity resolution", () => {
  it("resolves an activity at its registered site", () => {
    const result = resolveActivity(testContent, "test-forest", "chop-birch");
    expect(result.site.id).toBe("test-forest");
    expect(result.activity.id).toBe("chop-birch");
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
