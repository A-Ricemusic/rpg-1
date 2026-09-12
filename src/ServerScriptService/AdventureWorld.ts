import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { REGIONS } from "shared/Adventure";
export function makePart(
  name: string,
  position: Vector3,
  size: Vector3,
  parent: Instance,
  color = Color3.fromRGB(112, 160, 145),
): Part {
  const p = new Instance("Part");
  p.Name = name;
  p.Anchored = true;
  p.Size = size;
  p.Position = position;
  p.Color = color;
  p.Parent = parent;
  return p;
}
export function template(category: string, names: readonly string[]): Model | BasePart | undefined {
  const folder = ReplicatedStorage.FindFirstChild("GameAssets")?.FindFirstChild(category);
  if (!folder) return undefined;
  for (const name of names) {
    const found = folder.FindFirstChild(name, true);
    if (found?.IsA("Model") || found?.IsA("BasePart")) return found;
  }
  return undefined;
}
export function cloneVisual(
  category: string,
  names: readonly string[],
  position: Vector3,
  parent: Instance,
): Model | BasePart | undefined {
  const source = template(category, names);
  if (!source) return undefined;
  const clone = source.Clone();
  for (const d of clone.GetDescendants()) {
    if (d.IsA("BaseScript")) d.Destroy();
    else if (d.IsA("BasePart")) {
      d.Anchored = true;
      d.CanCollide = false;
      d.CanTouch = false;
    }
  }
  if (clone.IsA("Model")) clone.PivotTo(new CFrame(position));
  else {
    clone.Position = position;
    clone.Anchored = true;
    clone.CanCollide = false;
  }
  clone.Parent = parent;
  return clone;
}
export type Resource = "Herb" | "Ore" | "Wood" | "Crystal";
export interface RegionLocation {
  center: Vector3;
  spawn: Vector3;
  merchant: Vector3;
  forge: Vector3;
  quest: Vector3;
  boss: Vector3;
  enemies: Vector3[];
  resources: { item: Resource; position: Vector3 }[];
}
export class AdventureWorld {
  readonly runtime = new Instance("Folder");
  readonly locations = new Array<RegionLocation>();
  readonly authored = Workspace.FindFirstChild("EldoriaWorld");
  readonly status: string;
  constructor() {
    this.runtime.Name = this.authored ? "DemigodRuntime" : "DemigodTestContent";
    this.runtime.Parent = Workspace;
    this.status = this.authored
      ? "Authored Eldoria world"
      : "Temporary test world — authored world unavailable";
    REGIONS.forEach((region, index) => {
      const model = this.authored?.FindFirstChild(region.model);
      const center = new Vector3(index * 360, 0, 0);
      const marker = (names: readonly string[], fallback: Vector3): Vector3 => {
        for (const name of names) {
          const found =
            model?.FindFirstChild(name, true) ??
            this.authored?.FindFirstChild(`${region.id}_${name}`, true);
          if (found?.IsA("BasePart")) return found.Position;
          if (found?.IsA("Attachment")) return found.WorldPosition;
        }
        return this.ground(center.add(fallback));
      };
      if (!this.authored)
        makePart(
          `${region.id}_TestGround`,
          center.sub(new Vector3(0, 2, 0)),
          new Vector3(340, 4, 280),
          this.runtime,
          Color3.fromRGB(48 + index * 12, 75, 65),
        );
      const merchant = marker(["MerchantLocation", "MerchantSpawn"], new Vector3(-105, 0, -66));
      const resources = new Array<{ item: Resource; position: Vector3 }>();
      for (const d of model?.GetDescendants() ?? []) {
        if (d.IsA("BasePart") && d.GetAttribute("MarkerType") === "Gathering") {
          const item = d.GetAttribute("ResourceId");
          if (item === "Herb" || item === "Ore" || item === "Wood" || item === "Crystal")
            resources.push({ item, position: d.Position });
        }
        // Runtime actors replace only the authored display copies, never the stored templates or environment.
        if (d.IsA("Model") && (d.Name === "BossArtwork" || d.Name.sub(1, 13) === "EnemyArtwork_")) {
          for (const part of d.GetDescendants())
            if (part.IsA("BasePart")) {
              part.Transparency = 1;
              part.CanCollide = false;
              part.CanQuery = false;
            }
          const h = d.FindFirstChildOfClass("Humanoid");
          if (h) h.DisplayDistanceType = Enum.HumanoidDisplayDistanceType.None;
        }
      }
      if (resources.size() === 0)
        (["Herb", "Herb", "Ore"] as const).forEach((item, i) =>
          resources.push({
            item,
            position: this.ground(center.add(new Vector3(-110 + i * 30, 0, 55))),
          }),
        );
      this.locations.push({
        center: marker(["Entrance"], new Vector3(-165, 0, 0)).Lerp(
          marker(["Exit"], new Vector3(165, 0, 0)),
          0.5,
        ),
        spawn: marker(
          ["PlayerSpawn", "CampSpawn"],
          merchant.sub(center).add(new Vector3(20, 0, 12)),
        ).add(new Vector3(0, 4, 0)),
        merchant,
        forge: marker(["BlacksmithLocation", "CraftingSpawn"], new Vector3(-122, 0, -35)),
        quest: marker(["QuestGiverLocation", "QuestSpawn"], new Vector3(-67, 0, -66)),
        boss: marker(["BossSpawn"], new Vector3(65, 0, 91)),
        enemies: [1, 2, 3, 4].map((n) =>
          marker(
            [`EnemySpawn_0${n}`, `EnemySpawn${n}`],
            new Vector3(-20 + (n - 1) * 35, 0, -38 - (n % 2) * 12),
          ),
        ),
        resources,
      });
    });
  }
  ground(position: Vector3): Vector3 {
    if (!this.authored) return new Vector3(position.X, 0, position.Z);
    const params = new RaycastParams();
    params.FilterType = Enum.RaycastFilterType.Include;
    params.FilterDescendantsInstances = [this.authored, Workspace.Terrain];
    const hit = Workspace.Raycast(
      position.add(new Vector3(0, 8, 0)),
      new Vector3(0, -40, 0),
      params,
    );
    return hit?.Position ?? position;
  }
}
