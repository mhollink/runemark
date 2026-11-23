import { gameContent } from "@runemark/content";
import { describe, expect, it } from "vitest";
import { findNearestBank, findShortestRoute } from "./find-route";

describe("world navigation", () => {
  it("finds the shortest direct route", () => {
    const path = findShortestRoute(gameContent, "eldvik-copper-mine", "eldvik");

    expect(path?.map((leg) => leg.routeId)).toEqual([
      "eldvik-copper-mine-route",
    ]);
    expect(path?.[0]?.durationMs).toBe(45_000);
  });

  it("prefers a shorter multi-hop route", () => {
    const content = {
      ...gameContent,
      routes: {
        ...gameContent.routes,
        shortcut: {
          id: "shortcut",
          fromId: "eldvik-birch-grove",
          toId: "eldvik-copper-mine",
          durationMs: 5_000,
        },
      },
    };

    const path = findShortestRoute(content, "eldvik", "eldvik-copper-mine");

    expect(path?.map((leg) => leg.routeId)).toEqual([
      "eldvik-birch-grove-route",
      "shortcut",
    ]);

    expect(
      findNearestBank(content, "eldvik-copper-mine")?.reduce(
        (total, leg) => total + leg.durationMs,
        0,
      ),
    ).toBe(40_000);
  });

  it("returns null for unreachable nodes", () => {
    expect(findShortestRoute(gameContent, "eldvik", "unknown")).toBeNull();
  });
});
