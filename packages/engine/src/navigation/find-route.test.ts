import { describe, expect, it } from "vitest";
import { testContent } from "../testing/test-content";
import { findNearestBank, findShortestRoute } from "./find-route";

describe("world navigation", () => {
  it("finds the shortest direct route in reverse", () => {
    const path = findShortestRoute(testContent, "test-mine", "test-town");
    expect(path).toEqual([
      {
        routeId: "mine-route",
        fromId: "test-mine",
        toId: "test-town",
        durationMs: 15_000,
      },
    ]);
  });

  it("prefers a shorter multi-hop route", () => {
    const content = {
      ...testContent,
      routes: {
        ...testContent.routes,
        shortcut: {
          id: "shortcut",
          fromId: "test-forest",
          toId: "test-mine",
          durationMs: 5_000,
        },
      },
    };
    const path = findShortestRoute(content, "test-town", "test-mine");
    expect(path?.map((leg) => leg.routeId)).toEqual([
      "forest-route",
      "shortcut",
    ]);
    expect(
      findNearestBank(content, "test-mine")?.map((leg) => leg.routeId),
    ).toEqual(["shortcut", "forest-route"]);
  });

  it("returns null for unknown nodes", () => {
    expect(findShortestRoute(testContent, "test-town", "unknown")).toBeNull();
  });

  it("returns null for disconnected nodes", () => {
    const { "mine-route": _removed, ...routes } = testContent.routes;
    const content = { ...testContent, routes };
    expect(findShortestRoute(content, "test-town", "test-mine")).toBeNull();
    expect(findNearestBank(content, "test-mine")).toBeNull();
  });

  it("returns an empty path when already at the destination", () => {
    expect(findShortestRoute(testContent, "test-town", "test-town")).toEqual(
      [],
    );
    expect(findNearestBank(testContent, "test-town")).toEqual([]);
  });
});
