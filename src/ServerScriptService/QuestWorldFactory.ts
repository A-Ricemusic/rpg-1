import { CollectionService, Workspace } from "@rbxts/services";
import { ALL_ENEMIES, EnemyDefinition, RegionId } from "shared/EnemyConfig";
import { QUESTS } from "shared/GameConfig";

interface RegionStyle {
  readonly id: RegionId;
  readonly name: string;
  readonly center: Vector3;
  readonly ground: Color3;
  readonly accent: Color3;
  readonly material: Enum.Material;
}

const REGIONS: readonly RegionStyle[] = [
  {
    id: "Verdant",
    name: "Verdant Reach",
    center: new Vector3(0, 0, 0),
    ground: Color3.fromRGB(61, 105, 66),
    accent: Color3.fromRGB(137, 218, 102),
    material: Enum.Material.Grass,
  },
  {
    id: "Ember",
    name: "Ember Wastes",
    center: new Vector3(300, 0, 0),
    ground: Color3.fromRGB(93, 53, 43),
    accent: Color3.fromRGB(255, 109, 45),
    material: Enum.Material.Basalt,
  },
  {
    id: "Frost",
    name: "Frostveil Shelf",
    center: new Vector3(-300, 0, 0),
    ground: Color3.fromRGB(159, 198, 211),
    accent: Color3.fromRGB(213, 249, 255),
    material: Enum.Material.Snow,
  },
  {
    id: "Storm",
    name: "Tempest Heights",
    center: new Vector3(0, 0, 300),
    ground: Color3.fromRGB(70, 83, 118),
    accent: Color3.fromRGB(118, 221, 255),
    material: Enum.Material.Slate,
  },
  {
    id: "Umbral",
    name: "Umbral Hollow",
    center: new Vector3(0, 0, -300),
    ground: Color3.fromRGB(45, 38, 60),
    accent: Color3.fromRGB(216, 79, 198),
    material: Enum.Material.Rock,
  },
];

const AUTHORED_REGION_NAMES = new Map<RegionId, string>([
  ["Verdant", "01_WhisperingWilds"],
  ["Ember", "04_EmberfallCaldera"],
  ["Frost", "03_FrostveilReach"],
  ["Storm", "08_ZephyrMesa"],
  ["Umbral", "10_UmbralHollow"],
]);

function resolveRegions(): [readonly RegionStyle[], boolean] {
  const authored = Workspace.FindFirstChild("EldoriaWorld");
  if (!authored) return [REGIONS, false];
  const resolved = new Array<RegionStyle>();
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

function createEnemy(definition: EnemyDefinition, position: Vector3, parent: Instance): Model {
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
  model.Parent = parent;
  CollectionService.AddTag(model, "Enemy");

  const glow = new Instance("PointLight");
  glow.Color = accent;
  glow.Brightness = definition.boss ? 2.2 : 0.8;
  glow.Range = definition.boss ? 28 : 12;
  glow.Parent = root;
  return model;
}

function createRegion(style: RegionStyle, parent: Instance): Folder {
  const folder = new Instance("Folder");
  folder.Name = style.id;
  folder.Parent = parent;
  const ground = part(
    `${style.id}Ground`,
    new Vector3(220, 2, 220),
    style.center.sub(new Vector3(0, 1, 0)),
    style.ground,
    folder,
    style.material,
  );
  ground.CanCollide = true;
  const beacon = part(
    "RegionBeacon",
    new Vector3(5, 16, 5),
    style.center.add(new Vector3(0, 8, 0)),
    style.accent,
    folder,
    Enum.Material.Neon,
  );
  const label = new Instance("BillboardGui");
  label.Size = UDim2.fromOffset(260, 55);
  label.StudsOffset = new Vector3(0, 11, 0);
  label.AlwaysOnTop = true;
  label.MaxDistance = 250;
  label.Parent = beacon;
  const text = new Instance("TextLabel");
  text.Size = UDim2.fromScale(1, 1);
  text.BackgroundTransparency = 1;
  text.Text = style.name;
  text.TextColor3 = style.accent;
  text.TextStrokeTransparency = 0.2;
  text.Font = Enum.Font.GothamBold;
  text.TextSize = 25;
  text.Parent = label;
  for (let index = 0; index < 10; index++) {
    const angle = (index / 10) * math.pi * 2;
    const pillar = part(
      "BoundaryPillar",
      new Vector3(2.5, 8 + (index % 3) * 2, 2.5),
      style.center.add(new Vector3(math.cos(angle) * 96, 4, math.sin(angle) * 96)),
      style.accent,
      folder,
      Enum.Material.Neon,
    );
    pillar.Transparency = 0.25;
  }
  return folder;
}

export function buildDemoWorld(): void {
  if (Workspace.FindFirstChild("RPGWorld")) return;
  const root = new Instance("Folder");
  root.Name = "RPGWorld";
  root.Parent = Workspace;
  const regions = new Instance("Folder");
  regions.Name = "Regions";
  regions.Parent = root;
  const enemies = new Instance("Folder");
  enemies.Name = "Enemies";
  enemies.Parent = root;

  const [activeRegions, usesAuthoredWorld] = resolveRegions();
  root.SetAttribute("UsesAuthoredWorld", usesAuthoredWorld);

  if (!usesAuthoredWorld) {
    activeRegions.forEach((style) => createRegion(style, regions));
    for (let index = 1; index < activeRegions.size(); index++) {
      const style = activeRegions[index];
      const midpoint = style.center.div(2);
      const length = style.center.Magnitude - 105;
      const road = part(
        `${style.id}Causeway`,
        new Vector3(24, 1, length),
        midpoint,
        Color3.fromRGB(87, 91, 96),
        root,
        Enum.Material.Pavement,
      );
      road.CFrame = CFrame.lookAt(midpoint, style.center);
    }
  }

  const placementScale = usesAuthoredWorld ? 9 : 1;

  QUESTS.forEach((quest, index) => {
    const region = activeRegions[math.floor(index / 2)];
    const localIndex = index % 2;
    const position = region.center.add(
      new Vector3(localIndex === 0 ? -72 : 72, 3 / placementScale, localIndex === 0 ? 54 : -54).mul(
        placementScale,
      ),
    );
    const item = part(
      `QuestItem_${index + 1}`,
      new Vector3(3, 3, 3),
      position,
      region.accent,
      root,
      Enum.Material.Neon,
    );
    item.Shape = Enum.PartType.Ball;
    item.SetAttribute("QuestTargetId", quest.targetId);
    item.SetAttribute("QuestIndex", index);
    CollectionService.AddTag(item, "QuestCollectible");
    const light = new Instance("PointLight");
    light.Color = region.accent;
    light.Range = 14;
    light.Parent = item;
  });

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
