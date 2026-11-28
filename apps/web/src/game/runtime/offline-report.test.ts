import { describe, expect, it } from "vitest";
import { createTestGame } from "@/test/fixtures/test-game";
import { createSimulationResult } from "@/test/fixtures/test-simulation";
import { createOfflineReport } from "./offline-report";
import { MIN_OFFLINE_DURATION_MS } from "./runtime-config";

describe("Offline report", () => {
  it("ignores short periods of inactivity", () => {
    const result = createSimulationResult(createTestGame(), {
      completedActions: 5,
    });

    expect(createOfflineReport(result, MIN_OFFLINE_DURATION_MS - 1)).toBeNull();
  });

  it("ignores periods without progress", () => {
    const result = createSimulationResult(createTestGame());

    expect(createOfflineReport(result, 60_000)).toBeNull();
  });

  it("reports completed actions", () => {
    const result = createSimulationResult(createTestGame(), {
      completedActions: 10,
    });

    expect(createOfflineReport(result, 60_000)).toEqual({
      elapsedMs: 60_000,
      summary: result.summary,
      events: [],
    });
  });

  it("reports currency rewards", () => {
    const result = createSimulationResult(createTestGame(), {
      coinsGained: 25,
    });

    expect(createOfflineReport(result, 60_000)?.summary.coinsGained).toBe(25);
  });

  it("reports bank trips", () => {
    const result = createSimulationResult(createTestGame(), {
      bankTrips: 2,
    });

    expect(createOfflineReport(result, 60_000)?.summary.bankTrips).toBe(2);
  });

  it("reports experience gains", () => {
    const result = createSimulationResult(createTestGame(), {
      experienceGained: {
        mining: 100,
      },
    });

    expect(
      createOfflineReport(result, 60_000)?.summary.experienceGained,
    ).toEqual({
      mining: 100,
    });
  });

  it("reports blocking events", () => {
    const result = {
      ...createSimulationResult(createTestGame()),

      events: [
        {
          type: "ACTIVITY_BLOCKED",
          nodeId: "test-mine",
          activityId: "mine-copper",
          timestamp: 100_000,
          reason: "BANK_UNAVAILABLE",
        } as const,
      ],
    };

    expect(createOfflineReport(result, 60_000)?.events).toEqual(result.events);
  });
});
