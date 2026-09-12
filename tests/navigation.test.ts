import { expect, test } from "bun:test";
import { bearing, destination } from "../src/ReplicatedStorage/Shared/Navigation";
Object.assign(globalThis, { math: { sqrt: Math.sqrt, abs: Math.abs, floor: Math.floor } });
test("world navigation covers all cardinal directions and nearby objectives", () => {
  expect(bearing(0, -1)).toBe("N");
  expect(bearing(1, -1)).toBe("NE");
  expect(bearing(1, 0)).toBe("E");
  expect(bearing(1, 1)).toBe("SE");
  expect(bearing(0, 1)).toBe("S");
  expect(bearing(-1, 1)).toBe("SW");
  expect(bearing(-1, 0)).toBe("W");
  expect(bearing(-1, -1)).toBe("NW");
  expect(bearing(0, 0)).toBe("here");
  expect(destination("Boss", 300, 400)).toBe("Boss: 500 studs SE");
});
