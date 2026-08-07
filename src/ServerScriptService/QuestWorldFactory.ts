import { CollectionService, Workspace } from "@rbxts/services";
import { QUESTS } from "shared/GameConfig";

const COLORS = [
  Color3.fromRGB(60, 160, 255),
  Color3.fromRGB(255, 90, 40),
  Color3.fromRGB(70, 210, 100),
  Color3.fromRGB(240, 190, 60),
  Color3.fromRGB(165, 110, 255),
  Color3.fromRGB(80, 220, 210),
  Color3.fromRGB(90, 170, 255),
  Color3.fromRGB(255, 215, 80),
  Color3.fromRGB(220, 235, 250),
  Color3.fromRGB(255, 70, 170),
];

function makePart(
  name: string,
  size: Vector3,
  position: Vector3,
  color: Color3,
  parent: Instance,
): Part {
  const part = new Instance("Part");
  part.Name = name;
  part.Size = size;
  part.Position = position;
  part.Color = color;
  part.Material = Enum.Material.Neon;
  part.Anchored = true;
  part.Parent = parent;
  return part;
}

export function buildDemoWorld(): void {
  let root = Workspace.FindFirstChild("RPGWorld") as Folder | undefined;
  if (root) return;
  root = new Instance("Folder");
  root.Name = "RPGWorld";
  root.Parent = Workspace;

  const ground = makePart(
    "QuestGround",
    new Vector3(260, 1, 260),
    new Vector3(0, -0.5, 0),
    Color3.fromRGB(42, 72, 48),
    root,
  );
  ground.Material = Enum.Material.Grass;
  ground.CanCollide = true;

  QUESTS.forEach((quest, index) => {
    const angle = (index / QUESTS.size()) * math.pi * 2;
    const radius = 32 + index * 7;
    const item = makePart(
      `QuestItem_${index + 1}`,
      new Vector3(3, 3, 3),
      new Vector3(math.cos(angle) * radius, 3, math.sin(angle) * radius),
      COLORS[index],
      root!,
    );
    item.Shape = Enum.PartType.Ball;
    item.SetAttribute("QuestTargetId", quest.targetId);
    item.SetAttribute("QuestIndex", index);
    CollectionService.AddTag(item, "QuestCollectible");
    const light = new Instance("PointLight");
    light.Color = COLORS[index];
    light.Range = 12;
    light.Parent = item;
  });

  for (let index = 0; index < 6; index++) {
    const model = new Instance("Model");
    model.Name = `Enemy_${index + 1}`;
    model.SetAttribute("Enemy", true);
    model.SetAttribute("Damage", 12 + index * 2);
    model.SetAttribute("XpReward", 35);
    const rootPart = makePart(
      "HumanoidRootPart",
      new Vector3(3, 4, 2),
      new Vector3(-42 + index * 17, 2, 32),
      Color3.fromRGB(175, 55, 55),
      model,
    );
    rootPart.Anchored = false;
    rootPart.CanCollide = true;
    const humanoid = new Instance("Humanoid");
    humanoid.MaxHealth = 60 + index * 10;
    humanoid.Health = humanoid.MaxHealth;
    humanoid.WalkSpeed = 10;
    humanoid.Parent = model;
    model.PrimaryPart = rootPart;
    model.Parent = root;
    CollectionService.AddTag(model, "Enemy");
  }
}
