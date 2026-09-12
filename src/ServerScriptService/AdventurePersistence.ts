import { DataStoreService, HttpService } from "@rbxts/services";
import { AdventureSave, freshAdventure, ITEMS, PARENTS, WEAPONS } from "shared/Adventure";
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
  if (PARENTS.some((p) => p === raw.parent)) fresh.parent = raw.parent;
  fresh.coins = number(raw.coins, 10000000);
  fresh.xp = number(raw.xp, 1000000);
  fresh.unlocked = number(raw.unlocked, 4);
  fresh.region = math.min(number(raw.region, 4), fresh.unlocked);
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
  fresh.victory = fresh.quests[4] === 3 && fresh.bosses[4];
  return fresh;
}
interface Envelope {
  data?: unknown;
  session?: unknown;
  expires?: unknown;
}
export class AdventurePersistence {
  private store?: DataStore;
  private readonly session = HttpService.GenerateGUID(false);
  constructor() {
    if (game.GameId !== 0) {
      const [ok, result] = pcall(() => DataStoreService.GetDataStore("DemigodAdventure_v2"));
      if (ok) this.store = result;
    }
  }
  load(player: Player): [AdventureSave, boolean, string] {
    const store = this.store;
    if (!store) return [freshAdventure(), false, "Session only: unpublished place"];
    for (let attempt = 1; attempt <= 3; attempt++) {
      let acquired = false;
      const [ok, result] = pcall(() =>
        store.UpdateAsync(tostring(player.UserId), (old: unknown) => {
          const envelope: Envelope = typeIs(old, "table") ? (old as Envelope) : {};
          if (
            typeIs(envelope.session, "string") &&
            envelope.session !== this.session &&
            typeIs(envelope.expires, "number") &&
            envelope.expires > os.time()
          )
            return $tuple(undefined);
          acquired = true;
          return $tuple({
            data: sanitize(envelope.data),
            session: this.session,
            expires: os.time() + 180,
          });
        }),
      );
      if (ok && acquired && typeIs(result, "table"))
        return [sanitize((result as Envelope).data), true, "Loaded • autosave every 45s"];
      if (attempt < 3) task.wait(attempt);
    }
    return [
      freshAdventure(),
      false,
      "Session only: save load unavailable (existing save protected)",
    ];
  }
  save(player: Player, data: AdventureSave, release: boolean): boolean {
    const store = this.store;
    if (!store) return false;
    let written = false;
    const [ok, failure] = pcall(() =>
      store.UpdateAsync(tostring(player.UserId), (old: unknown) => {
        if (!typeIs(old, "table") || (old as Envelope).session !== this.session)
          return $tuple(undefined);
        written = true;
        return $tuple({
          data,
          session: release ? "" : this.session,
          expires: release ? 0 : os.time() + 180,
        });
      }),
    );
    if (!ok) warn(`Demigod save failed: ${failure}`);
    return ok && written;
  }
}
