import { describe, expect, test } from "bun:test";
import {
  ABILITIES,
  LEVEL_CAP,
  QUESTS,
  xpForNextLevel,
} from "../src/ReplicatedStorage/Shared/GameConfig";
import { createProgress, grantXp } from "../src/ReplicatedStorage/Shared/Progression";

Object.assign(globalThis, { math: { huge: Number.POSITIVE_INFINITY, max: Math.max } });

describe("RPG progression contract", () => {
  test("has exactly one unique ability per level", () => {
    const names = ABILITIES.map((ability) => ability.name);
    expect(ABILITIES).toHaveLength(LEVEL_CAP);
    expect(new Set(names).size).toBe(20);
    ABILITIES.forEach((ability, index) => expect(ability.level).toBe(index + 1));
  });

  test("has ten sequential quests with unique targets", () => {
    expect(QUESTS).toHaveLength(10);
    expect(new Set(QUESTS.map((quest) => quest.targetId)).size).toBe(QUESTS.length);
    QUESTS.forEach((quest, index) => expect(quest.id).toBe(`q${index + 1}`));
  });

  test("level thresholds increase predictably", () => {
    expect(xpForNextLevel(1)).toBe(120);
    expect(xpForNextLevel(19)).toBe(840);
    for (let level = 1; level < LEVEL_CAP - 1; level++)
      expect(xpForNextLevel(level + 1)).toBeGreaterThan(xpForNextLevel(level));
  });

  test("large XP grants stop at cap and apply unlocked stat bonuses", () => {
    const initial = createProgress();
    const result = grantXp(initial, 100_000);
    expect(result.progress.level).toBe(20);
    expect(result.progress.xp).toBe(0);
    expect(result.progress.totalXp).toBe(100_000);
    expect(result.unlocked).toHaveLength(19);
    expect(result.progress.maxHealth).toBeGreaterThan(initial.maxHealth);
    expect(result.progress.maxMagicka).toBeGreaterThan(initial.maxMagicka);
    expect(result.progress.maxStamina).toBeGreaterThan(initial.maxStamina);
  });

  test("negative XP cannot reduce progress", () => {
    const initial = createProgress();
    expect(grantXp(initial, -50).progress).toEqual(initial);
  });

  test("non-finite XP cannot corrupt progress", () => {
    const initial = createProgress();
    expect(grantXp(initial, Number.NaN).progress).toEqual(initial);
    expect(grantXp(initial, Number.POSITIVE_INFINITY).progress).toEqual(initial);
  });
});
