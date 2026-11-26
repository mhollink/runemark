import { describe, expect, it } from "vitest";
import {
  advanceTestGame,
  START,
  startTestActivity,
} from "../testing/game-fixtures";
import { testContent } from "../testing/test-content";
import { locationForNode } from "./travel";

describe("travel", () => {
  it("travels to the selected site before gathering", () => {
    const initial = startTestActivity("test-forest", "chop-birch");
    const first = advanceTestGame(initial, START + 3_000);
    expect(first.summary.completedActions).toBe(0);
    expect(first.state.character.nodeId).toBe("test-town");
    expect(first.state.activeActivity?.elapsedMs).toBe(3_000);
    const arrived = advanceTestGame(first.state, START + 5_000);
    expect(arrived.summary.completedActions).toBe(0);
    expect(arrived.state.character.nodeId).toBe("test-forest");
    expect(arrived.state.character.locationId).toBe("test-town");
    expect(arrived.state.activeActivity?.phase).toBe("working");
    const worked = advanceTestGame(arrived.state, START + 10_000);
    expect(worked.summary.completedActions).toBe(1);
  });

  it("updates the settlement on arrival at a settlement", () => {
    expect(locationForNode(testContent, "test-village", "test-town")).toBe(
      "test-village",
    );
  });

  it("retains the last settlement when arriving at a site", () => {
    expect(locationForNode(testContent, "test-forest", "test-village")).toBe(
      "test-village",
    );
  });

  it("rejects unknown travel nodes", () => {
    expect(() => locationForNode(testContent, "unknown", "test-town")).toThrow(
      /Unknown travel node/,
    );
  });
});
