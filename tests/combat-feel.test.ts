import { expect, test } from "bun:test";
import { nextStrike, type AttackRhythm } from "../src/ReplicatedStorage/Shared/CombatFeel";
import { freshAdventure } from "../src/ReplicatedStorage/Shared/Adventure";
import { beginQuest, settleQuest, discover } from "../src/ReplicatedStorage/Shared/QuestFlow";
test("sword finisher requires three timely swings and weapon changes reset it", () => {
  const rhythm: AttackRhythm = { count: 0, lastAt: -100 };
  expect(nextStrike(rhythm, "Sword", 0).multiplier).toBe(1);
  expect(nextStrike(rhythm, "Sword", 0.4).combo).toBe(2);
  expect(nextStrike(rhythm, "Sword", 0.8).multiplier).toBe(1.6);
  expect(nextStrike(rhythm, "Sword", 3).combo).toBe(1);
  nextStrike(rhythm, "Bow", 3.6);
  expect(nextStrike(rhythm, "Sword", 4).combo).toBe(1);
});
test("bow rewards settling; trident rewards spacing", () => {
  const rhythm: AttackRhythm = { count: 0, lastAt: -100 };
  expect(nextStrike(rhythm, "Bow", 0).multiplier).toBe(1.3);
  expect(nextStrike(rhythm, "Bow", 0.6).multiplier).toBe(1);
  expect(nextStrike(rhythm, "Bow", 1.8).multiplier).toBe(1.3);
  expect(nextStrike(rhythm, "Trident", 3, 9).multiplier).toBe(1.25);
});
test("automatic quests settle once and all five bosses lead to victory", () => {
  const save = freshAdventure();
  for (let r = 0; r < 5; r++) {
    save.region = r;
    beginQuest(save);
    expect(settleQuest(save)).toBeUndefined();
    save.gathered[r] = 3;
    save.kills[r] = 2;
    expect(settleQuest(save)).toBeDefined();
    const coins = save.coins;
    expect(settleQuest(save)).toBeUndefined();
    expect(save.coins).toBe(coins);
    save.bosses[r] = true;
    expect(settleQuest(save)).toBeDefined();
  }
  expect(save.victory).toBe(true);
});
test("discovery rewards cannot be repeated or claimed for locked regions", () => {
  const save = freshAdventure();
  expect(discover(save, "Discovery_Ember_1")).toBe(false);
  expect(discover(save, "Discovery_Verdant_1")).toBe(true);
  expect(discover(save, "Discovery_Verdant_1")).toBe(false);
  expect(discover(save, "invented")).toBe(false);
  expect(save.coins).toBe(12);
  expect(save.xp).toBe(40);
  expect(save.inventory.Potion).toBe(4);
});
