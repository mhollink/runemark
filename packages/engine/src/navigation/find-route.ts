import type { GameContent } from "@runemark/content";
import type { TravelLeg } from "@runemark/domain";

export function findShortestRoute(
  content: GameContent,
  fromId: string,
  toId: string,
): readonly TravelLeg[] | null {
  const exists = (id: string) =>
    content.locations[id] !== undefined || content.sites[id] !== undefined;

  if (!exists(fromId) || !exists(toId)) return null;
  if (fromId === toId) return [];

  // Expand every bidirectional connection into two directed legs.
  const legs: TravelLeg[] = Object.values(content.routes)
    .flatMap((route) => [
      {
        routeId: route.id,
        fromId: route.fromId,
        toId: route.toId,
        durationMs: route.durationMs,
      },
      {
        routeId: route.id,
        fromId: route.toId,
        toId: route.fromId,
        durationMs: route.durationMs,
      },
    ])
    .sort((a, b) =>
      `${a.routeId}:${a.toId}`.localeCompare(`${b.routeId}:${b.toId}`),
    );

  const distances = new Map<string, number>([[fromId, 0]]);
  const previous = new Map<string, TravelLeg>();
  const frontier = new Set<string>([fromId]);
  const visited = new Set<string>();

  while (frontier.size > 0) {
    const current = [...frontier].sort(
      (a, b) =>
        (distances.get(a) ?? Infinity) - (distances.get(b) ?? Infinity) ||
        a.localeCompare(b),
    )[0];

    if (current === undefined) break;
    frontier.delete(current);

    if (current === toId) break;
    visited.add(current);

    for (const leg of legs) {
      if (leg.fromId !== current || visited.has(leg.toId)) {
        continue;
      }

      const distance = (distances.get(current) ?? Infinity) + leg.durationMs;

      if (distance < (distances.get(leg.toId) ?? Infinity)) {
        distances.set(leg.toId, distance);
        previous.set(leg.toId, leg);
        frontier.add(leg.toId);
      }
    }
  }

  if (!distances.has(toId)) return null;

  const path: TravelLeg[] = [];
  let nodeId = toId;

  while (nodeId !== fromId) {
    const leg = previous.get(nodeId);
    if (!leg) return null;

    path.unshift(leg);
    nodeId = leg.fromId;
  }

  return path;
}

export function findNearestBank(
  content: GameContent,
  fromId: string,
): readonly TravelLeg[] | null {
  let best: readonly TravelLeg[] | null = null;
  let bestDuration = Infinity;

  const banks = Object.values(content.locations)
    .filter((location) => location.facilities?.includes("bank"))
    .sort((a, b) => a.id.localeCompare(b.id));

  for (const bank of banks) {
    const path = findShortestRoute(content, fromId, bank.id);
    if (path === null) continue;

    const duration = path.reduce((sum, leg) => sum + leg.durationMs, 0);

    if (duration < bestDuration) {
      best = path;
      bestDuration = duration;
    }
  }

  return best;
}
