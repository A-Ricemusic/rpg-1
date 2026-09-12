import { AdventureRequest } from "./Adventure";
const REQUEST_KINDS: readonly AdventureRequest["kind"][] = [
  "Snapshot",
  "ChooseParent",
  "Equip",
  "Attack",
  "Ability",
  "Buy",
  "Sell",
  "Craft",
  "Upgrade",
  "Potion",
  "Quest",
  "Save",
  "Return",
  "Travel",
];
export interface RequestGate {
  requestTimes: Map<string, number>;
}
/** Different controls may be used together; repeated requests still have independent limits. */
export function admitRequest(gate: RequestGate, kind: string, now: number): boolean {
  if (!REQUEST_KINDS.some((known) => known === kind)) return false;
  const previous = gate.requestTimes.get(kind);
  if (previous !== undefined && now - previous < (kind === "Snapshot" ? 0.5 : 0.06)) return false;
  gate.requestTimes.set(kind, now);
  return true;
}
