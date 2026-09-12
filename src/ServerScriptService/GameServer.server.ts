import { inMeleeArc } from "shared/CombatTargeting";
import { Players, ReplicatedStorage, RunService, Workspace } from "@rbxts/services";
import {
  AdventureRequest,
  AdventureSave,
  AdventureSnapshot,
  claimQuest,
  DivineParent,
  ITEMS,
  Item,
  levelForXp,
  PARENTS,
  REGIONS,
  transact,
  Weapon,
  WEAPONS,
  WEAPON_STATS,
} from "shared/Adventure";
import { ALL_ENEMIES } from "shared/EnemyConfig";
import { AdventurePersistence } from "./AdventurePersistence";
import { AdventureWorld, cloneVisual, makePart, template, Resource } from "./AdventureWorld";
import { createEnemy } from "./EnemyFactory";
import { startEnemySystem } from "./EnemyService";

const world = new AdventureWorld();
const persistence = new AdventurePersistence();
const remotes = new Instance("Folder");
remotes.Name = "RPGRemotes";
remotes.Parent = ReplicatedStorage;
const request = new Instance("RemoteEvent");
request.Name = "Request";
request.Parent = remotes;
const event = new Instance("RemoteEvent");
event.Name = "Event";
event.Parent = remotes;
interface State {
  data: AdventureSave;
  mana: number;
  attackAt: number;
  abilityAt: number;
  requestAt: number;
  potionAt: number;
  message: string;
  canSave: boolean;
  saveStatus: string;
  saving: boolean;
  saveAt: number;
  returnAt: number;
}
const states = new Map<Player, State>();
const enemies = new Array<Model>();
function root(player: Player): BasePart | undefined {
  const p = player.Character?.FindFirstChild("HumanoidRootPart");
  return p?.IsA("BasePart") ? p : undefined;
}
function alive(player: Player): boolean {
  return (player.Character?.FindFirstChildOfClass("Humanoid")?.Health ?? 0) > 0;
}
function near(player: Player, position: Vector3, distance = 18): boolean {
  const p = root(player);
  return p !== undefined && p.Position.sub(position).Magnitude <= distance;
}
function message(player: Player, text: string): void {
  const s = states.get(player);
  if (s) {
    s.message = text;
    sync(player);
  }
}
function sync(player: Player): void {
  const s = states.get(player);
  if (!s) return;
  const d = s.data;
  const location = world.locations[d.region];
  const h = player.Character?.FindFirstChildOfClass("Humanoid");
  const stage = d.quests[d.region];
  const objective =
    stage === 0
      ? "Speak to the Oracle or accept the regional quest."
      : stage === 1
        ? `Gather ${math.min(d.gathered[d.region], 3)}/3 • Defeat ${math.min(d.kills[d.region], 2)}/2 → Claim reward`
        : stage === 2
          ? d.bosses[d.region]
            ? "Boss defeated! Claim your reward to open the next region."
            : "Defeat the regional boss. Follow the BOSS beacon."
          : d.victory
            ? "Victory! Eldoria is restored."
            : "Region restored. Travel to the next region.";
  const snapshot: AdventureSnapshot = {
    ...d,
    health: h?.Health ?? 0,
    maxHealth: h?.MaxHealth ?? 100,
    level: levelForXp(d.xp),
    mana: s.mana,
    abilityCooldown: math.max(0, s.abilityAt - os.clock()),
    message: s.message,
    saveStatus: s.saveStatus,
    worldStatus: world.status,
    nearMerchant: near(player, location.merchant),
    nearForge: near(player, location.forge),
    objective,
  };
  player.SetAttribute("Region", d.region);
  player.SetAttribute("AtCamp", near(player, location.spawn, 55));
  player.SetAttribute("DivineParent", d.parent);
  player.SetAttribute("Coins", d.coins);
  player.SetAttribute("Victory", d.victory);
  event.FireClient(player, { kind: "Snapshot", snapshot });
}
function stats(player: Player): void {
  const s = states.get(player);
  const h = player.Character?.FindFirstChildOfClass("Humanoid");
  if (!s || !h) return;
  const maximum = 100 + (levelForXp(s.data.xp) - 1) * 12;
  const delta = maximum - h.MaxHealth;
  h.MaxHealth = maximum;
  if (delta > 0) h.Health += delta;
}
function equip(player: Player, weapon: Weapon): void {
  const s = states.get(player);
  const character = player.Character;
  if (!s || !character || s.data.inventory[weapon] <= 0) return;
  s.data.equipped = weapon;
  for (const child of character.GetChildren())
    if (child.IsA("Tool") && child.GetAttribute("DemigodEquipment")) child.Destroy();
  const backpack = player.FindFirstChildOfClass("Backpack");
  if (backpack)
    for (const child of backpack.GetChildren())
      if (child.GetAttribute("DemigodEquipment")) child.Destroy();
  const tool = new Instance("Tool");
  tool.Name = weapon;
  tool.CanBeDropped = false;
  tool.ManualActivationOnly = true;
  tool.SetAttribute("DemigodEquipment", true);
  const authoredTool = ReplicatedStorage.FindFirstChild("GameAssets")
    ?.FindFirstChild("Weapons")
    ?.FindFirstChild(weapon);
  if (authoredTool?.IsA("Tool")) {
    const ready = authoredTool.Clone();
    ready.CanBeDropped = false;
    ready.ManualActivationOnly = true;
    ready.SetAttribute("DemigodEquipment", true);
    const grip = ready.FindFirstChild("Handle");
    if (grip?.IsA("BasePart")) {
      for (const d of ready.GetDescendants()) {
        if (d.IsA("BaseScript")) d.Destroy();
        else if (d.IsA("BasePart")) {
          d.Anchored = false;
          d.CanCollide = false;
          d.CanTouch = false;
          d.Massless = true;
          if (d !== grip) {
            const w = new Instance("WeldConstraint");
            w.Part0 = grip;
            w.Part1 = d;
            w.Parent = d;
          }
        }
      }
      ready.Parent = character;
      tool.Destroy();
      return;
    }
    ready.Destroy();
  }
  const source = template("Weapons", [weapon, `Bronze${weapon}`, `${weapon}Template`]);
  const handle = new Instance("Part");
  handle.Name = "Handle";
  handle.Size = new Vector3(0.35, weapon === "Trident" ? 6 : 3, 0.35);
  handle.Color = Color3.fromRGB(218, 179, 83);
  handle.CanCollide = false;
  handle.Massless = true;
  handle.Parent = tool;
  if (source) {
    handle.Transparency = 1;
    const visual = source.Clone();
    visual.Name = "Visual";
    if (visual.IsA("Model")) visual.PivotTo(handle.CFrame);
    else visual.CFrame = handle.CFrame;
    visual.Parent = tool;
    const parts: BasePart[] = visual.IsA("BasePart") ? [visual] : [];
    for (const child of visual.GetDescendants()) {
      if (child.IsA("BaseScript")) child.Destroy();
      else if (child.IsA("BasePart")) parts.push(child);
    }
    for (const p of parts) {
      p.Anchored = false;
      p.CanCollide = false;
      p.CanTouch = false;
      p.Massless = true;
      const weld = new Instance("WeldConstraint");
      weld.Part0 = handle;
      weld.Part1 = p;
      weld.Parent = p;
    }
  } else if (weapon === "Trident" || weapon === "Bow") {
    for (const x of [-0.8, 0.8]) {
      const p = handle.Clone();
      p.Name = "Prong";
      p.Size = new Vector3(0.2, 2, 0.2);
      p.CFrame = handle.CFrame.mul(new CFrame(x, 1.5, 0));
      p.Parent = tool;
      const weld = new Instance("WeldConstraint");
      weld.Part0 = handle;
      weld.Part1 = p;
      weld.Parent = p;
    }
  }
  tool.Grip = new CFrame(0, -0.8, 0);
  tool.Parent = character;
}
function respawn(player: Player): void {
  const s = states.get(player);
  if (!s) return;
  const character = player.Character;
  const h = character?.WaitForChild("Humanoid", 10);
  if (!character || !h?.IsA("Humanoid")) return;
  character.WaitForChild("HumanoidRootPart", 10);
  stats(player);
  h.Health = h.MaxHealth;
  s.mana = 60;
  character.PivotTo(new CFrame(world.locations[s.data.region].spawn));
  if (s.data.parent) equip(player, s.data.equipped);
  h.Died.Once(() => {
    s.message = "You fell. Respawning at your region's camp; inventory and progress are kept.";
    sync(player);
  });
  sync(player);
}
function save(player: Player, release = false): void {
  const s = states.get(player);
  if (!s || !s.canSave) return;
  while (s.saving) task.wait();
  s.saving = true;
  const success = persistence.save(player, s.data, release);
  s.saveStatus = success ? "Saved" : "Save failed — retrying at next autosave";
  s.saving = false;
  sync(player);
}
function beacon(parent: BasePart, text: string): void {
  const gui = new Instance("BillboardGui");
  gui.Name = "Beacon";
  gui.Size = UDim2.fromOffset(200, 65);
  gui.StudsOffset = new Vector3(0, 5, 0);
  gui.AlwaysOnTop = true;
  gui.MaxDistance = 250;
  gui.Parent = parent;
  const label = new Instance("TextLabel");
  label.BackgroundTransparency = 1;
  label.Size = UDim2.fromScale(1, 1);
  label.Text = text;
  label.TextColor3 = Color3.fromRGB(255, 227, 153);
  label.TextStrokeTransparency = 0.25;
  label.TextSize = 16;
  label.TextWrapped = true;
  label.Parent = gui;
}
function interact(
  name: string,
  position: Vector3,
  label: string,
  callback: (player: Player) => void,
  visualCategory?: string,
  visualNames: readonly string[] = [],
): BasePart {
  const p = makePart(
    name,
    position.add(new Vector3(0, 1.5, 0)),
    new Vector3(2, 3, 2),
    world.runtime,
  );
  p.CanCollide = false;
  if (
    world.authored &&
    (name.find("Merchant")[0] !== undefined ||
      name.find("Oracle")[0] !== undefined ||
      name.find("Herb")[0] !== undefined ||
      name.find("Ore")[0] !== undefined ||
      name.find("Wood")[0] !== undefined ||
      name.find("Crystal")[0] !== undefined)
  )
    p.Transparency = 1;
  else if (visualCategory && cloneVisual(visualCategory, visualNames, position, world.runtime))
    p.Transparency = 1;
  beacon(p, label);
  const prompt = new Instance("ProximityPrompt");
  prompt.ActionText = label;
  prompt.ObjectText = name;
  prompt.HoldDuration = 0.25;
  prompt.MaxActivationDistance = 12;
  prompt.RequiresLineOfSight = false;
  prompt.Parent = p;
  prompt.Triggered.Connect((player) => {
    const s = states.get(player);
    if (s?.data.parent && alive(player) && near(player, p.Position, 16)) callback(player);
  });
  return p;
}
REGIONS.forEach((region, index) => {
  const l = world.locations[index];
  interact(
    `${region.id}_Merchant`,
    l.merchant,
    "MERCHANT • E to shop",
    (player) => {
      if (states.get(player)?.data.region === index)
        event.FireClient(player, { kind: "Open", panel: "Inventory" });
    },
    "Characters",
    ["Merchant", "Shopkeeper"],
  );
  interact(
    `${region.id}_Forge`,
    l.forge,
    "FORGE • Potions & upgrades",
    (player) => {
      if (states.get(player)?.data.region === index)
        event.FireClient(player, { kind: "Open", panel: "Inventory" });
    },
    "Items",
    ["Anvil", "CraftingTable"],
  );
  interact(
    `${region.id}_Oracle`,
    l.quest,
    "ORACLE • Accept / claim quest",
    (player) => {
      const s = states.get(player);
      if (s?.data.region === index) {
        message(player, claimQuest(s.data));
        stats(player);
      }
    },
    "Characters",
    ["Oracle", "QuestGiver", "NPC"],
  );
  const gather = (item: Resource, p: Vector3, n: number): void => {
    const cooldown = new Map<Player, number>();
    interact(
      `${region.id}_${item}${n}`,
      p,
      `GATHER ${item} • E`,
      (player) => {
        const s = states.get(player);
        if (!s || s.data.region !== index || s.data.unlocked < index) return;
        if (os.clock() < (cooldown.get(player) ?? 0)) {
          message(player, "This resource regrows in 8 seconds.");
          return;
        }
        cooldown.set(player, os.clock() + 8);
        s.data.inventory[item]++;
        s.data.gathered[index]++;
        s.data.xp += 5;
        message(player, `Collected ${item} (+5 XP).`);
        stats(player);
      },
      "Items",
      [item, item === "Herb" ? "HealingHerb" : "IronOre"],
    );
    Players.PlayerRemoving.Connect((player) => cooldown.delete(player));
  };
  l.resources.forEach((r, n) => gather(r.item, r.position, n));
  const roster = ALL_ENEMIES.filter((e) => e.region === region.id);
  for (const definition of roster) {
    const position = definition.boss ? l.boss : l.enemies[roster.indexOf(definition)];
    const spawn = (): void => {
      const model = createEnemy(definition, position, world.runtime);
      model.SetAttribute("AdventureRegion", index);
      enemies.push(model);
      if (definition.boss && model.PrimaryPart)
        beacon(model.PrimaryPart, `BOSS • ${definition.name}`);
      model.FindFirstChildOfClass("Humanoid")?.Died.Once(() => {
        task.delay(definition.boss ? 25 : 12, () => {
          const i = enemies.indexOf(model);
          if (i >= 0) enemies.remove(i);
          model.Destroy();
          spawn();
        });
      });
    };
    spawn();
  }
});
function damage(player: Player, enemy: Model, amount: number): boolean {
  const s = states.get(player);
  const h = enemy.FindFirstChildOfClass("Humanoid");
  if (!s || !h || h.Health <= 0 || enemy.GetAttribute("AdventureRegion") !== s.data.region)
    return false;
  if (enemy.GetAttribute("Boss") === true && s.data.quests[s.data.region] < 2) {
    message(player, "Complete the gathering and enemy quest before challenging the boss.");
    return false;
  }
  h.TakeDamage(amount);
  if (h.Health <= 0) {
    const boss = enemy.GetAttribute("Boss") === true;
    s.data.kills[s.data.region]++;
    if (boss) s.data.bosses[s.data.region] = true;
    s.data.coins += boss ? 100 : 18;
    const reward = enemy.GetAttribute("XpReward");
    s.data.xp += typeIs(reward, "number") ? reward : 30;
    stats(player);
    message(
      player,
      boss ? "Boss defeated! Claim your quest reward." : "+18 coins • Enemy defeated!",
    );
  }
  return true;
}
function combat(player: Player, direction: Vector3, ability: boolean): void {
  const s = states.get(player);
  const p = root(player);
  if (!s || !p || !s.data.parent || !alive(player)) return;
  const now = os.clock();
  const weapon = WEAPON_STATS[s.data.equipped];
  if (ability ? now < s.abilityAt || s.mana < 20 : now < s.attackAt) return;
  if (ability) {
    s.abilityAt = now + 6;
    s.mana -= 20;
  } else s.attackAt = now + weapon.cooldown;
  const aim = direction.Unit;
  const origin = p.Position.add(new Vector3(0, 1, 0));
  const params = new RaycastParams();
  params.FilterType = Enum.RaycastFilterType.Exclude;
  params.FilterDescendantsInstances = player.Character ? [player.Character] : [];
  const range = ability
    ? s.data.parent === "Zeus"
      ? 100
      : s.data.parent === "Poseidon"
        ? 30
        : 20
    : weapon.range;
  let endpoint = origin.add(aim.mul(range));
  let hits = 0;
  let rejected = false;
  const previousMessage = s.message;
  const ray = Workspace.Raycast(origin, aim.mul(range), params);
  if (ray) endpoint = ray.Position;
  const power =
    (ability
      ? s.data.parent === "Zeus"
        ? 85
        : 65
      : weapon.damage + s.data.upgrades[s.data.equipped] * 10) +
    (levelForXp(s.data.xp) - 1) * 2;
  for (const enemy of enemies) {
    const target = enemy.PrimaryPart;
    if (!target || (enemy.FindFirstChildOfClass("Humanoid")?.Health ?? 0) <= 0) continue;
    const delta = target.Position.sub(origin);
    if (delta.Magnitude > range + target.Size.Magnitude / 2) continue;
    const ranged = (!ability && s.data.equipped === "Bow") || (ability && s.data.parent === "Zeus");
    let hit = false;
    if (ranged) {
      // The first ray already establishes both the body hit and its clear line of sight.
      hit = ray !== undefined && ray.Instance.IsDescendantOf(enemy);
    } else if (!ability) {
      const horizontal = new Vector3(aim.X, 0, aim.Z);
      const facing = horizontal.Magnitude > 0.1 ? horizontal : p.CFrame.LookVector;
      hit = inMeleeArc(facing.X, facing.Z, delta.X, delta.Z);
    } else {
      hit = s.data.parent === "Hades" || delta.Magnitude < 3 || aim.Dot(delta.Unit) > 0.35;
    }
    if (!hit) continue;
    if (!ranged) {
      const sight = Workspace.Raycast(origin, delta, params);
      if (sight && !sight.Instance.IsDescendantOf(enemy)) continue;
    }
    if (!damage(player, enemy, power)) {
      rejected = true;
      continue;
    }
    hits++;
    if (ability && s.data.parent === "Poseidon") enemy.SetAttribute("StunnedUntil", now + 2);
  }
  if (ability && s.data.parent === "Hades") {
    const h = player.Character?.FindFirstChildOfClass("Humanoid");
    if (h) h.Health = math.min(h.MaxHealth, h.Health + 15);
  }
  if (!rejected && s.message === previousMessage) {
    s.message =
      hits > 0
        ? `Hit ${hits} target(s) • ${power} damage`
        : "No target hit. Move closer for melee; aim at an enemy with Click/R or center the view for the Attack button.";
  }
  const effect = ability ? s.data.parent : s.data.equipped;
  event.FireAllClients({ kind: "Effect", origin, position: endpoint, effect, radius: range });
  player.SetAttribute("LastCombatResult", `${effect}: ${hits} hits`);
  const tool = player.Character?.FindFirstChildOfClass("Tool");
  if (tool && !ability) {
    const rest = tool.Grip;
    tool.Grip = new CFrame(0, -0.8, 0).mul(CFrame.Angles(math.rad(-65), 0, 0));
    task.delay(0.18, () => {
      if (tool.Parent) tool.Grip = rest;
    });
  }
  sync(player);
}
request.OnServerEvent.Connect((player, raw: unknown) => {
  const s = states.get(player);
  if (!s || !typeIs(raw, "table")) return;
  const r = raw as AdventureRequest;
  if (!typeIs(r.kind, "string")) return;
  const now = os.clock();
  if (now - s.requestAt < 0.06) return;
  s.requestAt = now;
  if (r.kind === "Snapshot") {
    sync(player);
    return;
  }
  if (r.kind === "ChooseParent") {
    if (!s.data.parent && PARENTS.some((p) => p === r.parent)) {
      s.data.parent = r.parent as DivineParent;
      equip(player, s.data.equipped);
      message(player, `${r.parent} has claimed you. Accept your first quest!`);
    }
    return;
  }
  if (!s.data.parent || !alive(player)) return;
  const l = world.locations[s.data.region];
  if (r.kind === "Equip" && WEAPONS.some((w) => w === r.item)) {
    equip(player, r.item);
    sync(player);
  } else if (
    (r.kind === "Attack" || r.kind === "Ability") &&
    typeIs(r.direction, "Vector3") &&
    r.direction.Magnitude > 0.1 &&
    r.direction.Magnitude < 10000
  )
    combat(player, r.direction, r.kind === "Ability");
  else if ((r.kind === "Buy" || r.kind === "Sell") && ITEMS.some((i) => i === r.item))
    message(
      player,
      near(player, l.merchant)
        ? transact(s.data, r.kind, r.item as Item)
        : "Visit the merchant at camp to trade.",
    );
  else if (r.kind === "Craft" || r.kind === "Upgrade")
    message(
      player,
      near(player, l.forge)
        ? transact(s.data, r.kind, s.data.equipped)
        : "Visit the forge at camp.",
    );
  else if (r.kind === "Quest") {
    message(player, claimQuest(s.data));
    stats(player);
  } else if (r.kind === "Potion") {
    const h = player.Character?.FindFirstChildOfClass("Humanoid");
    if (h && s.data.inventory.Potion > 0 && now >= s.potionAt && h.Health < h.MaxHealth) {
      s.data.inventory.Potion--;
      s.potionAt = now + 2;
      h.Health = math.min(h.MaxHealth, h.Health + 60);
      message(player, "Restored 60 health.");
    } else message(player, "Need a potion, missing health, and a 2-second cooldown.");
  } else if (
    r.kind === "Travel" &&
    typeIs(r.region, "number") &&
    r.region === math.floor(r.region) &&
    r.region >= 0 &&
    r.region <= s.data.unlocked
  ) {
    if (!near(player, l.spawn, 35)) {
      message(player, "Return to camp to travel.");
      return;
    }
    s.data.region = r.region;
    player.Character?.PivotTo(new CFrame(world.locations[r.region].spawn));
    message(player, `Welcome to ${REGIONS[r.region].name}.`);
  } else if (r.kind === "Return") {
    if (now < s.returnAt) return;
    s.returnAt = now + 10;
    message(player, "Returning to camp in 3 seconds. Stand still and avoid damage.");
    const start = root(player)?.Position;
    const health = player.Character?.FindFirstChildOfClass("Humanoid")?.Health;
    task.delay(3, () => {
      const h = player.Character?.FindFirstChildOfClass("Humanoid");
      if (start && near(player, start, 4) && h && h.Health === health && alive(player)) {
        player.Character?.PivotTo(new CFrame(world.locations[s.data.region].spawn));
        message(player, "Returned to camp.");
      } else message(player, "Return interrupted.");
    });
  } else if (r.kind === "Save" && now - s.saveAt > 10) {
    s.saveAt = now;
    task.spawn(() => save(player));
  }
});
function join(player: Player): void {
  const [data, canSave, saveStatus] = persistence.load(player);
  if (player.Parent !== Players) return;
  states.set(player, {
    data,
    canSave,
    saveStatus,
    saving: false,
    mana: 60,
    attackAt: 0,
    abilityAt: 0,
    requestAt: 0,
    potionAt: 0,
    saveAt: -100,
    returnAt: 0,
    message: "Welcome to Eldoria. Choose your divine parent.",
  });
  player.CharacterAdded.Connect(() => task.defer(() => respawn(player)));
  if (player.Character) task.defer(() => respawn(player));
}
Players.PlayerAdded.Connect(join);
Players.GetPlayers().forEach((p) => task.spawn(() => join(p)));
Players.PlayerRemoving.Connect((player) => {
  save(player, true);
  states.delete(player);
});
game.BindToClose(() => {
  let pending = states.size();
  states.forEach((_, p) =>
    task.spawn(() => {
      save(p, true);
      pending--;
    }),
  );
  const deadline = os.clock() + 25;
  while (pending > 0 && os.clock() < deadline) task.wait(0.1);
});
task.spawn(() => {
  while (task.wait(45)) states.forEach((_, p) => task.spawn(() => save(p)));
});
startEnemySystem({
  damagePlayer: (player, damage) => {
    const s = states.get(player);
    if (!s?.data.parent) return;
    const p = root(player);
    if (p && !near(player, world.locations[s.data.region].spawn, 55))
      player.Character?.FindFirstChildOfClass("Humanoid")?.TakeDamage(damage);
  },
});
let tick = 0;
RunService.Heartbeat.Connect((dt) => {
  tick += dt;
  states.forEach((s, p) => {
    s.mana = math.min(60, s.mana + dt * 5);
    if (tick >= 0.25) {
      const position = root(p)?.Position;
      if (position && alive(p)) {
        let closest = s.data.region;
        let distance = math.huge;
        world.locations.forEach((l, i) => {
          const d = new Vector3(position.X - l.center.X, 0, position.Z - l.center.Z).Magnitude;
          if (d < distance) {
            closest = i;
            distance = d;
          }
        });
        if (closest <= s.data.unlocked && closest !== s.data.region) s.data.region = closest;
        if (closest > s.data.unlocked) {
          p.Character?.PivotTo(new CFrame(world.locations[s.data.region].spawn));
          s.message = "That region is locked. Complete your current boss quest.";
        }
      }
      sync(p);
    }
  });
  if (tick >= 0.25) tick = 0;
});
print(`Demigod adventure ready: ${world.status}`);
