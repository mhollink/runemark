import {gameContent} from "../packages/content/src";

const monsters = Object.values(gameContent.monsters)
  .map(({ id, name, combat }) => {
    const { maxHitpoints, maxHit, accuracy, attackIntervalMs, defense } =
      combat;

    const averageDefense = (defense.melee + defense.ranged + defense.magic) / 3;
    const dps = ((maxHit + 1) / 2) * accuracy * (1000 / attackIntervalMs);
    const effectiveHitpoints = maxHitpoints * (1 + averageDefense / 100);
    const difficulty = 10 * Math.sqrt((dps * effectiveHitpoints) / 2);

    return {
      id,
      name,
        combatLevel: Math.max(1, Math.round(difficulty)),
        hitpoints: maxHitpoints,
      maxHit,
        speed: attackIntervalMs / 1000,
        dps,
    };
  })
  .sort((a, b) => a.combatLevel - b.combatLevel);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(monsters, null, 2));
} else if (process.argv.includes("--csv")) {
  console.log(Object.keys(monsters[0] ?? {}).join(","));

  for (const monster of monsters) {
    console.log(Object.values(monster).join(","));
  }
} else {
  console.table(
    monsters.map((monster) => ({
      ...monster,
      dps: Number(monster.dps.toFixed(3)),
    })),
  );
}
