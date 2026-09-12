import { expect, test } from "bun:test";
import { admitRequest } from "../src/ReplicatedStorage/Shared/RequestGate";
test("snapshot traffic cannot swallow an attack in the same frame", () => {
  const gate = { requestTimes: new Map<string, number>() };
  expect(admitRequest(gate, "Snapshot", 10)).toBe(true);
  expect(admitRequest(gate, "Attack", 10)).toBe(true);
  expect(admitRequest(gate, "Attack", 10.01)).toBe(false);
  expect(admitRequest(gate, "Snapshot", 10.01)).toBe(false);
  expect(admitRequest(gate, "Attack", 10.1)).toBe(true);
  expect(admitRequest(gate, "Snapshot", 10.5)).toBe(true);
});
test("equipping, attacking, casting and healing can occur in the same frame", () => {
  const gate = { requestTimes: new Map<string, number>() };
  for (const kind of ["Equip", "Attack", "Potion", "Ability"]) {
    expect(admitRequest(gate, kind, 10)).toBe(true);
    expect(admitRequest(gate, kind, 10.01)).toBe(false);
  }
});
test("unknown request names cannot allocate throttle entries", () => {
  const gate = { requestTimes: new Map<string, number>() };
  for (let i = 0; i < 100; i++) expect(admitRequest(gate, `invalid-${i}`, i)).toBe(false);
  expect(gate.requestTimes.size).toBe(0);
});
