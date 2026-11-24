import type { GameContent } from "@runemark/content";
import type { TravelLeg } from "@runemark/domain";

export function findShortestRoute(
  content: GameContent,
  fromId: string,
  toId: string,
): readonly TravelLeg[] | null {
  if (!isKnownNode(content, fromId) || !isKnownNode(content, toId)) return null;
  if (fromId === toId) return [];

  const legs = createTravelLegs(content);

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

  return distances.has(toId) ? reconstructPath(previous, fromId, toId) : null;
}

function isKnownNode(content: GameContent, nodeId: string): boolean {
  return (
    content.locations[nodeId] !== undefined ||
    content.sites[nodeId] !== undefined
  );
}

function createTravelLegs(content: GameContent): readonly TravelLeg[] {
  // Expand every bidirectional connection into two directed legs.
  return Object.values(content.routes)
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
}

function reconstructPath(
  previous: ReadonlyMap<string, TravelLeg>,
  fromId: string,
  toId: string,
): readonly TravelLeg[] | null {
  const path: TravelLeg[] = [];
  let nodeId = toId;

  while (nodeId !== fromId) {
    const leg = previous.get(nodeId);
    if (!leg) return null;

    path.push(leg);
    nodeId = leg.fromId;
  }

  return path.reverse();
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

    const duration = routeDuration(path);

    if (duration < bestDuration) {
      best = path;
      bestDuration = duration;
    }
  }

  return best;
}

export function routeDuration(route: readonly TravelLeg[]): number {
  return route.reduce((sum, leg) => sum + leg.durationMs, 0);
}
