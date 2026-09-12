import { expect, test } from "bun:test";
import { updateReturn } from "../src/ReplicatedStorage/Shared/ReturnChannel";
test("camp return tolerates regeneration", () => {
  const channel = { cancelled: false, lastHealth: 60 };
  updateReturn(channel, 61, 0, true);
  updateReturn(channel, 62, 0.5, true);
  expect(channel.cancelled).toBe(false);
});
test("damage, movement, death and respawn permanently cancel camp return", () => {
  for (const [health, distance, sameCharacter] of [
    [59, 0, true],
    [60, 5, true],
    [0, 0, true],
    [100, 0, false],
  ] as const) {
    const channel = { cancelled: false, lastHealth: 60 };
    updateReturn(channel, health, distance, sameCharacter);
    updateReturn(channel, 100, 0, true);
    expect(channel.cancelled).toBe(true);
  }
});
