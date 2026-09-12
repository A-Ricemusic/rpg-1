import { expect, test } from "bun:test";
import { freshAdventure } from "../src/ReplicatedStorage/Shared/Adventure";
import { acquireSave, writeSave } from "../src/ReplicatedStorage/Shared/SaveLease";
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
test("session lease refuses competing writers and permits takeover only after expiry", () => {
  const first = acquireSave(undefined, "first", 100);
  expect(first?.expires).toBe(280);
  expect(acquireSave(first, "second", 279)).toBeUndefined();
  expect(writeSave(first, freshAdventure(), "second", 200, false)).toBeUndefined();
  const next = acquireSave(first, "second", 280);
  expect(next?.session).toBe("second");
  expect(writeSave(next, freshAdventure(), "first", 281, false)).toBeUndefined();
});
test("release permits immediate reload with earned data intact", () => {
  const first = acquireSave(undefined, "first", 100);
  const earned = freshAdventure();
  earned.parent = "Poseidon";
  earned.coins = 81;
  const released = writeSave(first, earned, "first", 110, true);
  expect(released?.expires).toBe(0);
  expect(acquireSave(released, "second", 111)?.data).toEqual(earned);
});
test("unsupported envelopes are never replaced with fresh profiles", () => {
  for (const invalid of ["bad", {}, { data: { version: 99 } }, { data: "bad" }]) {
    expect(acquireSave(invalid, "first", 100)).toBeUndefined();
  }
});
