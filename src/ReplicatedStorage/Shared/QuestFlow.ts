import { AdventureSave, claimQuest, REGIONS } from "./Adventure";
export const DISCOVERY_IDS: readonly string[] = REGIONS.reduce<string[]>((ids, region) => {
  for (let i = 1; i <= 3; i++) ids.push(`Discovery_${region.id}_${i}`);
  return ids;
}, []);
export function beginQuest(save: AdventureSave): string | undefined {
  return save.quests[save.region] === 0 ? claimQuest(save) : undefined;
}
export function settleQuest(save: AdventureSave): string | undefined {
  const region = save.region;
  const stage = save.quests[region];
  if (
    (stage === 1 && save.gathered[region] >= 3 && save.kills[region] >= 2) ||
    (stage === 2 && save.bosses[region])
  )
    return claimQuest(save);
  return undefined;
}
export function discover(save: AdventureSave, id: string): boolean {
  if (!DISCOVERY_IDS.some((known) => known === id) || save.discoveries.includes(id)) return false;
  const belongs = [1, 2, 3].some((i) => id === `Discovery_${REGIONS[save.region].id}_${i}`);
  if (!belongs || save.region > save.unlocked) return false;
  save.discoveries.push(id);
  save.coins += 12;
  save.xp += 40;
  save.inventory.Potion++;
  return true;
}
