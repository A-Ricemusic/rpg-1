import { describe, expect, test } from "bun:test";
import { ALL_ENEMIES, BOSSES, REGULAR_ENEMIES } from "../src/ReplicatedStorage/Shared/EnemyConfig";

describe("enemy roster contract", () => {
  test("contains twenty regular enemies and five bosses", () => {
    expect(REGULAR_ENEMIES).toHaveLength(20);
    expect(BOSSES).toHaveLength(5);
    expect(ALL_ENEMIES).toHaveLength(25);
    expect(new Set(ALL_ENEMIES.map((enemy) => enemy.id)).size).toBe(25);
    expect(new Set(ALL_ENEMIES.map((enemy) => enemy.name)).size).toBe(25);
  });

  test("places four regular enemies and one boss in every region", () => {
    for (const region of ["Verdant", "Ember", "Frost", "Storm", "Umbral"] as const) {
      expect(REGULAR_ENEMIES.filter((enemy) => enemy.region === region)).toHaveLength(4);
      expect(BOSSES.filter((enemy) => enemy.region === region)).toHaveLength(1);
    }
  });

  test("covers every implemented combat behavior", () => {
    const attacks = new Set(ALL_ENEMIES.map((enemy) => enemy.attack));
    for (const attack of ["Melee", "Dash", "Projectile", "Volley", "Spike", "Nova", "Summon"])
      expect(attacks.has(attack)).toBe(true);
  });

  test("all combat values are viable and bosses are stronger", () => {
    ALL_ENEMIES.forEach((enemy) => {
      expect(enemy.health).toBeGreaterThan(0);
      expect(enemy.damage).toBeGreaterThan(0);
      expect(enemy.speed).toBeGreaterThan(0);
      expect(enemy.range).toBeGreaterThanOrEqual(6);
      expect(enemy.cooldown).toBeGreaterThan(0);
      expect(enemy.xp).toBeGreaterThan(0);
    });
    BOSSES.forEach((boss) => {
      expect(boss.boss).toBe(true);
      expect(boss.health).toBeGreaterThanOrEqual(650);
      expect(boss.xp).toBeGreaterThanOrEqual(260);
    });
  });
});
