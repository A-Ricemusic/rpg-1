export interface RequestGate {
  requestAt: number;
  snapshotAt: number;
}
/** Background state requests must not consume the player's action budget. */
export function admitRequest(gate: RequestGate, kind: string, now: number): boolean {
  if (kind === "Snapshot") {
    if (now - gate.snapshotAt < 0.5) return false;
    gate.snapshotAt = now;
    return true;
  }
  if (now - gate.requestAt < 0.06) return false;
  gate.requestAt = now;
  return true;
}
