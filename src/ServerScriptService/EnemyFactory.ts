import { CollectionService, Workspace } from "@rbxts/services";
import { cloneVisual } from "./AdventureWorld";
import { ALL_ENEMIES, EnemyDefinition, RegionId } from "shared/EnemyConfig";

interface EnemyRegion {
  readonly id: RegionId;
  readonly center: Vector3;
}

const REGIONS: readonly EnemyRegion[] = [
  { id: "Verdant", center: new Vector3(0, 0, 0) },
  { id: "Ember", center: new Vector3(300, 0, 0) },
  { id: "Frost", center: new Vector3(-300, 0, 0) },
  { id: "Storm", center: new Vector3(0, 0, 300) },
  { id: "Umbral", center: new Vector3(0, 0, -300) },
];

const AUTHORED_REGION_NAMES = new Map<RegionId, string>([
  ["Verdant", "01_WhisperingWilds"],
  ["Ember", "04_EmberfallCaldera"],
  ["Frost", "03_FrostveilReach"],
  ["Storm", "08_ZephyrMesa"],
  ["Umbral", "10_UmbralHollow"],
]);

function resolveRegions(): [readonly EnemyRegion[], boolean] {
  const authored = Workspace.FindFirstChild("EldoriaWorld");
  if (!authored) return [REGIONS, false];
  const resolved = new Array<EnemyRegion>();
  for (const style of REGIONS) {
    const model = authored.FindFirstChild(AUTHORED_REGION_NAMES.get(style.id) ?? "");
    if (!model?.IsA("Model")) return [REGIONS, false];
    const [bounds] = model.GetBoundingBox();
    resolved.push({ ...style, center: new Vector3(bounds.Position.X, 0, bounds.Position.Z) });
  }
  return [resolved, true];
}

function rgb(value: readonly [number, number, number]): Color3 {
  return Color3.fromRGB(value[0], value[1], value[2]);
}

function part(
  name: string,
  size: Vector3,
  position: Vector3,
  color: Color3,
  parent: Instance,
  material = Enum.Material.SmoothPlastic as Enum.Material,
): Part {
  const value = new Instance("Part");
  value.Name = name;
  value.Size = size;
  value.Position = position;
  value.Color = color;
  value.Material = material;
  value.Anchored = true;
  value.TopSurface = Enum.SurfaceType.Smooth;
  value.BottomSurface = Enum.SurfaceType.Smooth;
  value.Parent = parent;
  return value;
}

function weldDecoration(
  root: BasePart,
  name: string,
  size: Vector3,
  offset: CFrame,
  color: Color3,
  shape = Enum.PartType.Block as Enum.PartType,
): Part {
  const value = new Instance("Part");
  value.Name = name;
  value.Size = size;
  value.CFrame = root.CFrame.mul(offset);
  value.Color = color;
  value.Material = Enum.Material.Neon;
  value.Shape = shape;
  value.CanCollide = false;
  value.CanQuery = false;
  value.Massless = true;
  value.Parent = root.Parent;
  const weld = new Instance("WeldConstraint");
  weld.Part0 = root;
  weld.Part1 = value;
  weld.Parent = value;
  return value;
}

export function createEnemy(
  definition: EnemyDefinition,
  position: Vector3,
  parent: Instance,
): Model {
  const model = new Instance("Model");
  model.Name = definition.id;
  model.SetAttribute("Enemy", true);
  model.SetAttribute("EnemyType", definition.id);
  model.SetAttribute("AttackType", definition.attack);
  model.SetAttribute("Damage", definition.damage);
  model.SetAttribute("AttackRange", definition.range);
  model.SetAttribute("AttackCooldown", definition.cooldown);
  model.SetAttribute("XpReward", definition.xp);
  model.SetAttribute("Region", definition.region);
  model.SetAttribute("Boss", definition.boss === true);
  model.SetAttribute("ProjectileCount", definition.projectileCount ?? 1);
  model.SetAttribute("SpawnPosition", position);

  const scale = definition.scale;
  const root = part(
    "HumanoidRootPart",
    new Vector3(3.4, 4.6, 2.8).mul(scale),
    position.add(new Vector3(0, 2.3 * scale, 0)),
    rgb(definition.color),
    model,
  );
  root.Anchored = true;
  root.CanCollide = true;
  root.Material = definition.boss ? Enum.Material.Metal : Enum.Material.SmoothPlastic;
  const accent = rgb(definition.accent);
  weldDecoration(
    root,
    "Core",
    new Vector3(1.5, 1.5, 0.45).mul(scale),
    new CFrame(0, 0.25 * scale, -1.55 * scale),
    accent,
    Enum.PartType.Ball,
  );
  weldDecoration(
    root,
    "Crown",
    new Vector3(2.1, 0.5, 2.1).mul(scale),
    new CFrame(0, 2.4 * scale, 0),
    accent,
  );
  if (
    definition.attack === "Projectile" ||
    definition.attack === "Volley" ||
    definition.attack === "Summon"
  )
    weldDecoration(
      root,
      "Focus",
      new Vector3(0.65, 3.2, 0.65).mul(scale),
      new CFrame(1.9 * scale, 0, 0).mul(CFrame.Angles(0, 0, math.rad(25))),
      accent,
      Enum.PartType.Cylinder,
    );
  if (definition.attack === "Dash") {
    weldDecoration(
      root,
      "LeftBlade",
      new Vector3(0.35, 2.8, 0.9).mul(scale),
      new CFrame(-2 * scale, 0, 0),
      accent,
    );
    weldDecoration(
      root,
      "RightBlade",
      new Vector3(0.35, 2.8, 0.9).mul(scale),
      new CFrame(2 * scale, 0, 0),
      accent,
    );
  }

  const humanoid = new Instance("Humanoid");
  humanoid.DisplayName = definition.name;
  humanoid.MaxHealth = definition.health;
  humanoid.Health = definition.health;
  humanoid.WalkSpeed = definition.speed;
  humanoid.RequiresNeck = false;
  humanoid.HealthDisplayType = Enum.HumanoidHealthDisplayType.AlwaysOn;
  humanoid.NameDisplayDistance = definition.boss ? 140 : 80;
  humanoid.HealthDisplayDistance = definition.boss ? 140 : 80;
  humanoid.Parent = model;
  model.PrimaryPart = root;
  const visual =
    cloneVisual("Characters", [definition.id, definition.name], position, model) ??
    cloneVisual("Rigs", [definition.id, definition.boss ? "Boss" : "Enemy"], position, model);
  if (visual) {
    for (const child of model.GetChildren()) if (child.IsA("BasePart")) child.Transparency = 1;
    for (const child of visual.GetDescendants()) if (child.IsA("Humanoid")) child.Destroy();
  }
  const healthGui = new Instance("BillboardGui");
  healthGui.Name = "EnemyHealth";
  healthGui.Size = UDim2.fromOffset(180, 44);
  healthGui.StudsOffset = new Vector3(0, root.Size.Y / 2 + 3, 0);
  healthGui.AlwaysOnTop = true;
  healthGui.MaxDistance = 180;
  healthGui.Parent = root;
  const healthLabel = new Instance("TextLabel");
  healthLabel.BackgroundTransparency = 0.3;
  healthLabel.BackgroundColor3 = Color3.fromRGB(20, 22, 30);
  healthLabel.Size = UDim2.fromScale(1, 1);
  healthLabel.TextColor3 = rgb(definition.accent);
  healthLabel.TextSize = 13;
  healthLabel.TextWrapped = true;
  healthLabel.Parent = healthGui;
  const updateHealth = () => {
    healthLabel.Text = `${definition.name}\n${math.ceil(humanoid.Health)} / ${humanoid.MaxHealth} HP • ${definition.attack}`;
  };
  updateHealth();
  humanoid.HealthChanged.Connect(updateHealth);
  model.Parent = parent;
  CollectionService.AddTag(model, "Enemy");

  const glow = new Instance("PointLight");
  glow.Color = accent;
  glow.Brightness = definition.boss ? 2.2 : 0.8;
  glow.Range = definition.boss ? 28 : 12;
  glow.Parent = root;
  return model;
}

export function spawnEnemies(): void {
  if (Workspace.FindFirstChild("RPGEnemies")) return;
  const enemies = new Instance("Folder");
  enemies.Name = "RPGEnemies";
  enemies.Parent = Workspace;

  const [activeRegions, usesAuthoredWorld] = resolveRegions();
  const placementScale = usesAuthoredWorld ? 9 : 1;

  const offsets = [
    new Vector3(-58, 0, -35),
    new Vector3(58, 0, -35),
    new Vector3(-58, 0, 35),
    new Vector3(58, 0, 35),
  ];
  activeRegions.forEach((region) => {
    const roster = ALL_ENEMIES.filter((definition) => definition.region === region.id);
    roster.forEach((definition, index) => {
      const position = definition.boss
        ? region.center.add(new Vector3(0, 0, 82 * placementScale))
        : region.center.add(offsets[index].mul(placementScale));
      createEnemy(definition, position, enemies);
    });
  });
}
