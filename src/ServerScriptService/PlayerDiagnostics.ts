import { HttpService, ServerStorage } from "@rbxts/services";
import { AdventureSave } from "shared/Adventure";
/** Server-only, inspectable state. No client can read other players' profiles or mutate this mirror. */
export class PlayerDiagnostics {
  private readonly folder = new Instance("Folder");
  private readonly players = new Map<
    Player,
    {
      folder: Folder;
      profile: StringValue;
      history: StringValue;
      lines: string[];
      lastProfile: string;
    }
  >();
  constructor() {
    this.folder.Name = "DemigodDiagnostics";
    this.folder.Parent = ServerStorage;
  }
  update(player: Player, data: AdventureSave, status: string, writable: boolean): void {
    let record = this.players.get(player);
    if (!record) {
      const folder = new Instance("Folder");
      folder.Name = tostring(player.UserId);
      folder.SetAttribute("Username", player.Name);
      folder.Parent = this.folder;
      const profile = new Instance("StringValue");
      profile.Name = "ProfileJSON";
      profile.Parent = folder;
      const history = new Instance("StringValue");
      history.Name = "RecentEvents";
      history.Parent = folder;
      record = { folder, profile, history, lines: [], lastProfile: "" };
      this.players.set(player, record);
    }
    const serialized = HttpService.JSONEncode(data);
    if (serialized !== record.lastProfile) {
      record.profile.Value = serialized;
      record.lastProfile = serialized;
      record.folder.SetAttribute("UpdatedAt", os.time());
    }
    record.folder.SetAttribute("SaveStatus", status);
    record.folder.SetAttribute("CanPersist", writable);
    record.folder.SetAttribute("PlaceId", game.PlaceId);
    record.folder.SetAttribute("GameId", game.GameId);
    record.folder.SetAttribute("Region", data.region + 1);
    record.folder.SetAttribute("Coins", data.coins);
    record.folder.SetAttribute("XP", data.xp);
  }
  record(player: Player, message: string): void {
    const record = this.players.get(player);
    if (!record) return;
    record.lines.push(`${os.time()} • ${message}`);
    if (record.lines.size() > 20) record.lines.shift();
    record.history.Value = record.lines.join("\n");
  }
  remove(player: Player): void {
    const record = this.players.get(player);
    record?.folder.Destroy();
    this.players.delete(player);
  }
}
