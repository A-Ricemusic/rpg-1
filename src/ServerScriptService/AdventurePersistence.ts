import { DataStoreService, HttpService } from "@rbxts/services";
import { AdventureSave, freshAdventure } from "shared/Adventure";
import { sanitize } from "shared/AdventureValidation";
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

          return $tuple({
            data: sanitize(envelope.data),
            session: this.session,
            expires: os.time() + 180,
          });
        }),
      );
      if (ok && typeIs(result, "table") && (result as Envelope).session === this.session)
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
    const snapshot = sanitize(data);
    const [ok, failure] = pcall(() =>
      store.UpdateAsync(tostring(player.UserId), (old: unknown) => {
        if (!typeIs(old, "table") || (old as Envelope).session !== this.session)
          return $tuple(undefined);

        return $tuple({
          data: snapshot,
          session: release ? "" : this.session,
          expires: release ? 0 : os.time() + 180,
        });
      }),
    );
    if (!ok) warn(`Demigod save failed: ${failure}`);
    return (
      ok &&
      typeIs(failure, "table") &&
      (failure as Envelope).session === (release ? "" : this.session)
    );
  }
}
