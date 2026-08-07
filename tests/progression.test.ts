import { describe, expect, test } from "bun:test";
import {
  ABILITIES,
  LEVEL_CAP,
  QUESTS,
  xpForNextLevel,
} from "../src/ReplicatedStorage/Shared/GameConfig";
import { createProgress, grantXp } from "../src/ReplicatedStorage/Shared/Progression";
import {
  completeQuestTarget,
  setQuestActive,
} from "../src/ReplicatedStorage/Shared/QuestProgression";

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

  test("quest targets only advance in active sequential order", () => {
    let progress = createProgress();
    expect(completeQuestTarget(progress, QUESTS[0].targetId).completed).toBeUndefined();
    progress = setQuestActive(progress, true);
    expect(completeQuestTarget(progress, QUESTS[1].targetId).completed).toBeUndefined();
    for (const quest of QUESTS) {
      progress = setQuestActive(progress, true);
      const completion = completeQuestTarget(progress, quest.targetId);
      expect(completion.completed?.id).toBe(quest.id);
      progress = grantXp(completion.progress, quest.xpReward).progress;
    }
    expect(progress.questIndex).toBe(10);
    expect(progress.questActive).toBe(false);
    expect(progress.level).toBe(6);
    expect(progress.xp).toBe(110);
    expect(progress.maxHealth).toBe(122);
    expect(progress.maxMagicka).toBe(73);
    expect(progress.maxStamina).toBe(98);
    expect(setQuestActive(progress, true).questActive).toBe(false);
  });
});
