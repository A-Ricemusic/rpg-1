import { AdventureSave, freshAdventure, ITEMS, PARENTS, WEAPONS } from "./Adventure";
import { DISCOVERY_IDS } from "./QuestFlow";
function number(value: unknown, maximum: number): number {
  return typeIs(value, "number") && value === value && math.abs(value) < math.huge
    ? math.clamp(math.floor(value), 0, maximum)
    : 0;
}
export function sanitize(value: unknown): AdventureSave {
  const fresh = freshAdventure();
  if (!typeIs(value, "table")) return fresh;
  const raw = value as Partial<AdventureSave>;
  if (raw.version !== 2) return fresh;
  if (typeIs(raw.discoveries, "table"))
    for (let i = 0; i < 15; i++) {
      const id = raw.discoveries[i];
      if (DISCOVERY_IDS.some((known) => known === id) && !fresh.discoveries.includes(id))
        fresh.discoveries.push(id);
    }
  if (PARENTS.some((p) => p === raw.parent)) fresh.parent = raw.parent;
  fresh.coins = number(raw.coins, 10000000);
  fresh.xp = number(raw.xp, 1000000);
  fresh.unlocked = number(raw.unlocked, 4);
  fresh.region = number(raw.region, 4);
  if (typeIs(raw.inventory, "table"))
    for (const item of ITEMS) fresh.inventory[item] = number(raw.inventory[item], 9999);
  if (typeIs(raw.upgrades, "table"))
    for (const weapon of WEAPONS) fresh.upgrades[weapon] = number(raw.upgrades[weapon], 5);
  if (WEAPONS.some((w) => w === raw.equipped) && raw.equipped && fresh.inventory[raw.equipped] > 0)
    fresh.equipped = raw.equipped;
  if (fresh.inventory[fresh.equipped] <= 0) fresh.inventory.Sword = 1;
  for (let i = 0; i < 5; i++) {
    fresh.quests[i] = typeIs(raw.quests, "table") ? number(raw.quests[i], 3) : 0;
    fresh.kills[i] = typeIs(raw.kills, "table") ? number(raw.kills[i], 10000) : 0;
    fresh.gathered[i] = typeIs(raw.gathered, "table") ? number(raw.gathered[i], 10000) : 0;
    fresh.bosses[i] = typeIs(raw.bosses, "table") && raw.bosses[i] === true;
  }
  // Unlocks follow completed boss quests, not a separately stored counter.
  fresh.unlocked = 0;
  for (let i = 0; i < 5; i++) {
    if (i > fresh.unlocked) {
      fresh.quests[i] = 0;
      fresh.bosses[i] = false;
    } else {
      if (fresh.quests[i] === 3 && !fresh.bosses[i]) fresh.quests[i] = 2;
      if (i < 4 && fresh.quests[i] === 3 && fresh.bosses[i]) fresh.unlocked = i + 1;
    }
  }
  fresh.region = math.min(fresh.region, fresh.unlocked);
  fresh.victory = fresh.quests[4] === 3 && fresh.bosses[4];
  return fresh;
}
