import { expect, test } from "bun:test";
import { SaveSessions } from "../src/ReplicatedStorage/Shared/SaveSessions";
test("rejoining the same server receives a different save owner token", () => {
  let sequence = 0;
  const sessions = new SaveSessions<{ userId: number }>(() => `join-${++sequence}`);
  const leaving = { userId: 42 };
  const rejoining = { userId: 42 };
  const oldToken = sessions.begin(leaving);
  const newToken = sessions.begin(rejoining);
  expect(newToken).not.toBe(oldToken);
  expect(sessions.begin(rejoining)).toBe(newToken);
  sessions.end(leaving, oldToken);
  expect(sessions.get(leaving)).toBeUndefined();
  expect(sessions.get(rejoining)).toBe(newToken);
  sessions.end(rejoining, oldToken);
  expect(sessions.get(rejoining)).toBe(newToken);
});
