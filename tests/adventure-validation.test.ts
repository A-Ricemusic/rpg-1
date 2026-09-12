import { expect, test } from "bun:test";
import { freshAdventure } from "../src/ReplicatedStorage/Shared/Adventure";
import { sanitize } from "../src/ReplicatedStorage/Shared/AdventureValidation";
Object.assign(globalThis, {
  typeIs: (value: unknown, kind: string) =>
    kind === "table" ? typeof value === "object" && value !== null : typeof value === kind,
  math: {
    huge: Infinity,
    max: Math.max,
    min: Math.min,
    floor: Math.floor,
    abs: Math.abs,
    clamp: (v: number, low: number, high: number) => Math.max(low, Math.min(v, high)),
  },
});
test("save serialization preserves parent, equipment, economy and campaign", () => {
  const s = freshAdventure();
  s.parent = "Hades";
  s.region = 4;
  s.unlocked = 4;
  s.coins = 432;
  s.xp = 6000;
  s.equipped = "Bow";
  s.upgrades.Bow = 5;
  s.inventory.Herb = 22;
  s.quests = [3, 3, 3, 3, 3];
  s.bosses = [true, true, true, true, true];
  s.victory = true;
  expect(sanitize(JSON.parse(JSON.stringify(s)))).toEqual(s);
});
test("corrupt saved fields cannot create invalid equipment, NaN stats or missing quest arrays", () => {
  const fixed = sanitize({
    version: 2,
    coins: NaN,
    xp: Infinity,
    parent: "Ares",
    equipped: "Laser",
    inventory: { Sword: -3, Bow: "bad" },
    upgrades: { Sword: 100 },
    region: 999,
    unlocked: 1,
  });
  expect(fixed.parent).toBeUndefined();
  expect(fixed.coins).toBe(0);
  expect(fixed.xp).toBe(0);
  expect(fixed.equipped).toBe("Sword");
  expect(fixed.inventory.Sword).toBe(1);
  expect(fixed.upgrades.Sword).toBe(5);
  expect(fixed.region).toBe(0);
  expect(fixed.quests).toEqual([0, 0, 0, 0, 0]);
  expect(fixed.victory).toBe(false);
});
test("unlock and victory counters cannot bypass sequential boss quests", () => {
  const s = freshAdventure();
  s.unlocked = 4;
  s.region = 4;
  s.victory = true;
  s.quests = [3, 2, 3, 3, 3];
  s.bosses = [true, false, true, true, true];
  const fixed = sanitize(s);
  expect(fixed.unlocked).toBe(1);
  expect(fixed.region).toBe(1);
  expect(fixed.quests).toEqual([3, 2, 0, 0, 0]);
  expect(fixed.victory).toBe(false);
});
test("completed quests recover an understated unlock counter", () => {
  const s = freshAdventure();
  s.region = 1;
  s.quests[0] = 3;
  s.bosses[0] = true;
  expect(sanitize(s).region).toBe(1);
  expect(sanitize(s).unlocked).toBe(1);
});
