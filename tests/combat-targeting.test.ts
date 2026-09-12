import { expect, test } from "bun:test";
import { inMeleeArc } from "../src/ReplicatedStorage/Shared/CombatTargeting";
Object.assign(globalThis, { math: { sqrt: Math.sqrt } });
test("downward cursor aim retains the same melee arc", () => {
  expect(inMeleeArc(0, -0.02, 0, -8)).toBe(true);
  expect(inMeleeArc(0, -1, 0, -8)).toBe(true);
});
test("melee arcs reject targets behind and handle close or zero aim safely", () => {
  expect(inMeleeArc(0, -1, 0, 8)).toBe(false);
  expect(inMeleeArc(0, 0, 0, 8)).toBe(false);
  expect(inMeleeArc(0, 0, 0, 0)).toBe(true);
});
