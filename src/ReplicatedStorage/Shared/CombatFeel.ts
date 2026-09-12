import { Weapon } from "./Adventure";
export interface AttackRhythm {
  weapon?: Weapon;
  count: number;
  lastAt: number;
}
export interface Strike {
  combo: number;
  multiplier: number;
  label: string;
}
/** A missed swing still advances the rhythm; changing weapons resets it. */
export function nextStrike(
  state: AttackRhythm,
  weapon: Weapon,
  now: number,
  distance?: number,
): Strike {
  const elapsed = now - state.lastAt;
  const continued = state.weapon === weapon && elapsed <= 1.35;
  state.count = weapon === "Sword" ? (continued ? (state.count % 3) + 1 : 1) : 1;
  state.weapon = weapon;
  state.lastAt = now;
  if (weapon === "Sword" && state.count === 3)
    return { combo: 3, multiplier: 1.6, label: "FINISHER" };
  if (weapon === "Trident" && distance !== undefined && distance >= 8)
    return { combo: 1, multiplier: 1.25, label: "TIP STRIKE" };
  if (weapon === "Bow" && (!continued || elapsed >= 1.1))
    return { combo: 1, multiplier: 1.3, label: "STEADY SHOT" };
  return { combo: state.count, multiplier: 1, label: "" };
}
export const QUEST_TITLES = [
  "The First Oath",
  "Embers of Resistance",
  "The Frozen Watch",
  "Break the Tempest",
  "The Last Gate",
] as const;
export const QUEST_BRIEFS = [
  "Recover supplies for the sanctuary and drive back the creatures in the groves.",
  "Stock the resistance forge and break the tyrant's patrols.",
  "Find supplies for the stranded watch and thin the frozen sentries.",
  "Prepare the storm shelters and silence the mesa's raiders.",
  "Gather offerings for the final seal and break the Sovereign's guard.",
] as const;
