import { expect, test } from "bun:test";
import { admitRequest } from "../src/ReplicatedStorage/Shared/RequestGate";
test("snapshot traffic cannot swallow an attack in the same frame", () => {
  const gate = { requestAt: 0, snapshotAt: 0 };
  expect(admitRequest(gate, "Snapshot", 10)).toBe(true);
  expect(admitRequest(gate, "Attack", 10)).toBe(true);
  expect(admitRequest(gate, "Attack", 10.01)).toBe(false);
  expect(admitRequest(gate, "Snapshot", 10.01)).toBe(false);
  expect(admitRequest(gate, "Attack", 10.1)).toBe(true);
  expect(admitRequest(gate, "Snapshot", 10.5)).toBe(true);
});
