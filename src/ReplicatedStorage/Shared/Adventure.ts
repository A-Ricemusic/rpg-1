export type DivineParent = "Poseidon" | "Zeus" | "Hades";
export type Weapon = "Sword" | "Trident" | "Bow";
export type Item = Weapon | "Herb" | "Ore" | "Wood" | "Crystal" | "Potion";
export const PARENTS: readonly DivineParent[] = ["Poseidon", "Zeus", "Hades"];
export const WEAPONS: readonly Weapon[] = ["Sword", "Trident", "Bow"];
export const ITEMS: readonly Item[] = [...WEAPONS, "Herb", "Ore", "Wood", "Crystal", "Potion"];
export const REGIONS = [
  { id: "Verdant", name: "Whispering Wilds", model: "01_WhisperingWilds", boss: "elder_briar" },
  { id: "Ember", name: "Emberfall Caldera", model: "04_EmberfallCaldera", boss: "pyre_tyrant" },
  { id: "Frost", name: "Frostveil Reach", model: "03_FrostveilReach", boss: "frost_colossus" },
  { id: "Storm", name: "Zephyr Mesa", model: "08_ZephyrMesa", boss: "skybreaker" },
  { id: "Umbral", name: "Umbral Hollow", model: "10_UmbralHollow", boss: "null_sovereign" },
] as const;
export const PRICES: Record<Item, number> = {
  Sword: 50,
  Trident: 60,
  Bow: 60,
  Herb: 6,
  Ore: 10,
  Wood: 4,
  Crystal: 12,
  Potion: 20,
};
export const SELL_PRICES: Record<Item, number> = {
  Sword: 20,
  Trident: 24,
  Bow: 24,
  Herb: 3,
  Ore: 5,
  Wood: 2,
  Crystal: 6,
  Potion: 8,
};
export const WEAPON_STATS: Record<Weapon, { damage: number; range: number; cooldown: number }> = {
  Sword: { damage: 30, range: 10, cooldown: 0.45 },
  Trident: { damage: 38, range: 16, cooldown: 0.65 },
  Bow: { damage: 28, range: 150, cooldown: 0.7 },
};
export interface AdventureSave {
  version: number;
  parent?: DivineParent;
  coins: number;
  xp: number;
  unlocked: number;
  region: number;
  victory: boolean;
  inventory: Record<Item, number>;
  upgrades: Record<Weapon, number>;
  equipped: Weapon;
  quests: number[];
  kills: number[];
  gathered: number[];
  bosses: boolean[];
}
export interface AdventureSnapshot extends AdventureSave {
  health: number;
  maxHealth: number;
  level: number;
  mana: number;
  abilityCooldown: number;
  message: string;
  saveStatus: string;
  worldStatus: string;
  nearMerchant: boolean;
  nearForge: boolean;
  objective: string;
  navigation: string;
}
export type AdventureRequest =
  | { kind: "Snapshot" }
  | { kind: "ChooseParent"; parent: DivineParent }
  | { kind: "Equip"; item: Weapon }
  | { kind: "Attack" | "Ability"; direction: Vector3 }
  | { kind: "Buy" | "Sell"; item: Item }
  | { kind: "Craft" | "Upgrade" | "Potion" | "Quest" | "Save" | "Return" }
  | { kind: "Travel"; region: number };
export function freshAdventure(): AdventureSave {
  return {
    version: 2,
    coins: 0,
    xp: 0,
    unlocked: 0,
    region: 0,
    victory: false,
    inventory: { Sword: 1, Trident: 1, Bow: 1, Herb: 0, Ore: 0, Wood: 0, Crystal: 0, Potion: 3 },
    upgrades: { Sword: 0, Trident: 0, Bow: 0 },
    equipped: "Sword",
    quests: [0, 0, 0, 0, 0],
    kills: [0, 0, 0, 0, 0],
    gathered: [0, 0, 0, 0, 0],
    bosses: [false, false, false, false, false],
  };
}
export function levelForXp(xp: number): number {
  let level = 1;
  let remaining = xp;
  while (level < 20 && remaining >= 80 + level * 40) {
    remaining -= 80 + level * 40;
    level++;
  }
  return level;
}
export function transact(
  save: AdventureSave,
  kind: "Buy" | "Sell" | "Craft" | "Upgrade",
  item: Item,
): string {
  if (kind === "Buy") {
    if (save.coins < PRICES[item]) return "Not enough coins.";
    if ((item === "Sword" || item === "Trident" || item === "Bow") && save.inventory[item] > 0)
      return "You already own this weapon.";
    save.coins -= PRICES[item];
    save.inventory[item]++;
    return `Bought ${item}.`;
  }
  if (kind === "Sell") {
    if (save.inventory[item] <= 0) return "You do not own that item.";
    if (item === save.equipped) return "Equip another weapon before selling this one.";
    save.inventory[item]--;
    save.coins += SELL_PRICES[item];
    return `Sold ${item}.`;
  }
  if (kind === "Craft") {
    if (save.inventory.Herb < 2 || save.inventory.Ore < 1) return "Requires 2 herbs and 1 ore.";
    save.inventory.Herb -= 2;
    save.inventory.Ore--;
    save.inventory.Potion++;
    return "Crafted a healing potion.";
  }
  const rank = save.upgrades[save.equipped];
  if (rank >= 5) return "Weapon is at maximum rank.";
  const cost = 25 * (rank + 1);
  if (save.coins < cost || save.inventory.Ore < rank + 1)
    return `Requires ${cost} coins and ${rank + 1} ore.`;
  save.coins -= cost;
  save.inventory.Ore -= rank + 1;
  save.upgrades[save.equipped]++;
  return `${save.equipped} upgraded to +${rank + 1}.`;
}
export function claimQuest(save: AdventureSave): string {
  const r = save.region;
  const stage = save.quests[r];
  if (stage === 0) {
    save.quests[r] = 1;
    return "Quest accepted: gather 3 resources and defeat 2 enemies.";
  }
  if (stage === 1) {
    if (save.gathered[r] < 3 || save.kills[r] < 2)
      return "Gather 3 resources and defeat 2 enemies first.";
    save.quests[r] = 2;
    save.coins += 60;
    save.xp += 120;
    return "Quest rewarded: +60 coins, +120 XP. Defeat the regional boss!";
  }
  if (stage === 2 && save.bosses[r]) {
    save.quests[r] = 3;
    save.coins += 120;
    save.xp += 200;
    if (r === 4) {
      save.victory = true;
      return "ELDORIA RESTORED — You have defeated the five sovereigns!";
    }
    save.unlocked = r + 1 > save.unlocked ? r + 1 : save.unlocked;
    return "Boss quest rewarded! The next region is unlocked.";
  }
  return stage === 3
    ? "This region is complete. Travel onward."
    : "Defeat the regional boss, then claim your reward.";
}
