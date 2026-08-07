import { CollectionService, Debris, Players, RunService, Workspace } from "@rbxts/services";
import { ALL_ENEMIES, EnemyDefinition } from "shared/EnemyConfig";

interface EnemyCallbacks {
  readonly damagePlayer: (player: Player, damage: number) => void;
}

const definitions = new Map<string, EnemyDefinition>();
ALL_ENEMIES.forEach((definition) => definitions.set(definition.id, definition));

function nearestPlayer(
  origin: Vector3,
  range: number,
): [Player | undefined, BasePart | undefined, number] {
  let nearest: Player | undefined;
  let nearestRoot: BasePart | undefined;
  let distance = range;
  Players.GetPlayers().forEach((player) => {
    const humanoid = player.Character?.FindFirstChildOfClass("Humanoid");
    const root = player.Character?.FindFirstChild("HumanoidRootPart");
    if (humanoid && humanoid.Health > 0 && root?.IsA("BasePart")) {
      const candidate = root.Position.sub(origin).Magnitude;
      if (candidate < distance) {
        nearest = player;
        nearestRoot = root;
        distance = candidate;
      }
    }
  });
  return [nearest, nearestRoot, distance];
}

function effectPart(name: string, size: Vector3, position: Vector3, color: Color3): Part {
  const value = new Instance("Part");
  value.Name = name;
  value.Size = size;
  value.Position = position;
  value.Color = color;
  value.Material = Enum.Material.Neon;
  value.Anchored = true;
  value.CanCollide = false;
  value.CanQuery = false;
  value.CanTouch = false;
  value.Parent = Workspace;
  return value;
}

function launchProjectile(
  origin: Vector3,
  target: Vector3,
  definition: EnemyDefinition,
  callbacks: EnemyCallbacks,
  damageScale = 1,
): void {
  const projectile = effectPart(
    "EnemyProjectile",
    new Vector3(1.3, 1.3, 1.3).mul(definition.boss ? 1.8 : 1),
    origin,
    Color3.fromRGB(definition.accent[0], definition.accent[1], definition.accent[2]),
  );
  projectile.Shape = Enum.PartType.Ball;
  const direction = target.sub(origin).Unit;
  const speed = definition.boss ? 64 : 48;
  task.spawn(() => {
    let traveled = 0;
    while (projectile.Parent && traveled < definition.range + 25) {
      const [dt] = RunService.Heartbeat.Wait();
      const step = speed * dt;
      projectile.Position = projectile.Position.add(direction.mul(step));
      traveled += step;
      const [player, root, distance] = nearestPlayer(projectile.Position, 3.2);
      if (player && root && distance < 3.2) {
        callbacks.damagePlayer(player, definition.damage * damageScale);
        projectile.Destroy();
        return;
      }
    }
    projectile.Destroy();
  });
}

function spikeAttack(
  targetPosition: Vector3,
  definition: EnemyDefinition,
  callbacks: EnemyCallbacks,
): void {
  const color = Color3.fromRGB(definition.accent[0], definition.accent[1], definition.accent[2]);
  const radius = definition.boss ? 10 : 6;
  const warning = effectPart(
    "DangerTelegraph",
    new Vector3(0.25, radius * 2, radius * 2),
    new Vector3(targetPosition.X, 0.15, targetPosition.Z),
    color,
  );
  warning.Shape = Enum.PartType.Cylinder;
  warning.CFrame = new CFrame(warning.Position).mul(CFrame.Angles(0, 0, math.rad(90)));
  warning.Transparency = 0.35;
  task.delay(definition.boss ? 0.7 : 1, () => {
    if (!warning.Parent) return;
    warning.Destroy();
    const spike = effectPart(
      "EnergySpike",
      new Vector3(radius, 18, radius),
      new Vector3(targetPosition.X, 9, targetPosition.Z),
      color,
    );
    spike.Shape = Enum.PartType.Ball;
    Players.GetPlayers().forEach((player) => {
      const root = player.Character?.FindFirstChild("HumanoidRootPart");
      if (
        root?.IsA("BasePart") &&
        new Vector3(root.Position.X, 0, root.Position.Z).sub(
          new Vector3(targetPosition.X, 0, targetPosition.Z),
        ).Magnitude <= radius
      )
        callbacks.damagePlayer(player, definition.damage);
    });
    Debris.AddItem(spike, 0.35);
  });
}

function novaAttack(origin: Vector3, definition: EnemyDefinition, callbacks: EnemyCallbacks): void {
  const color = Color3.fromRGB(definition.accent[0], definition.accent[1], definition.accent[2]);
  const radius = definition.range;
  const warning = effectPart(
    "NovaTelegraph",
    new Vector3(0.2, radius * 2, radius * 2),
    origin.sub(new Vector3(0, origin.Y - 0.15, 0)),
    color,
  );
  warning.Shape = Enum.PartType.Cylinder;
  warning.CFrame = new CFrame(origin.X, 0.15, origin.Z).mul(CFrame.Angles(0, 0, math.rad(90)));
  warning.Transparency = 0.55;
  task.delay(0.85, () => {
    if (!warning.Parent) return;
    Players.GetPlayers().forEach((player) => {
      const root = player.Character?.FindFirstChild("HumanoidRootPart");
      if (root?.IsA("BasePart") && root.Position.sub(origin).Magnitude <= radius)
        callbacks.damagePlayer(player, definition.damage);
    });
    warning.Transparency = 0.1;
    Debris.AddItem(warning, 0.25);
  });
}

function rangedAttack(
  root: BasePart,
  target: BasePart,
  definition: EnemyDefinition,
  callbacks: EnemyCallbacks,
): void {
  const count = definition.attack === "Projectile" ? 1 : (definition.projectileCount ?? 3);
  for (let index = 0; index < count; index++) {
    const spread = count === 1 ? 0 : (index - (count - 1) / 2) * 3.5;
    const elevated = definition.attack === "Summon" ? 8 + (index % 3) * 3 : 1.5;
    const origin = root.Position.add(new Vector3(0, elevated, 0));
    const targetPosition = target.Position.add(
      new Vector3(spread, definition.attack === "Summon" ? -2 : 0, 0),
    );
    task.delay(index * 0.1, () =>
      launchProjectile(origin, targetPosition, definition, callbacks, count > 5 ? 0.65 : 1),
    );
  }
}

export function startEnemySystem(callbacks: EnemyCallbacks): RBXScriptConnection {
  const cooldowns = new Map<Model, number>();
  const dashUntil = new Map<Model, number>();
  return RunService.Heartbeat.Connect((dt) => {
    const now = os.clock();
    for (const instance of CollectionService.GetTagged("Enemy")) {
      if (!instance.IsA("Model") || instance.GetAttribute("Enemy") !== true) continue;
      const definitionId = instance.GetAttribute("EnemyType");
      if (!typeIs(definitionId, "string")) continue;
      const definition = definitions.get(definitionId);
      const humanoid = instance.FindFirstChildOfClass("Humanoid");
      const root = instance.FindFirstChild("HumanoidRootPart");
      if (!definition || !humanoid || humanoid.Health <= 0 || !root?.IsA("BasePart")) continue;
      const [player, targetRoot, distance] = nearestPlayer(
        root.Position,
        math.max(110, definition.range + 25),
      );
      if (!player || !targetRoot) continue;
      const ranged =
        definition.attack === "Projectile" ||
        definition.attack === "Volley" ||
        definition.attack === "Spike" ||
        definition.attack === "Summon";
      const dashing = now < (dashUntil.get(instance) ?? 0);
      const desiredDistance = dashing ? 4 : ranged ? definition.range * 0.7 : definition.range;
      if (distance > desiredDistance) {
        const horizontalTarget = new Vector3(
          targetRoot.Position.X,
          root.Position.Y,
          targetRoot.Position.Z,
        );
        const delta = horizontalTarget.sub(root.Position);
        if (delta.Magnitude > 0.01) {
          const speed = definition.speed * (dashing ? 2.4 : 1);
          const nextPosition = root.Position.add(
            delta.Unit.mul(math.min(delta.Magnitude, speed * dt)),
          );
          instance.PivotTo(CFrame.lookAt(nextPosition, horizontalTarget));
        }
      }
      if (now < (cooldowns.get(instance) ?? 0) || distance > definition.range) continue;
      cooldowns.set(instance, now + definition.cooldown);
      const enraged = definition.boss === true && humanoid.Health / humanoid.MaxHealth <= 0.5;
      if (definition.attack === "Melee")
        callbacks.damagePlayer(player, definition.damage * (enraged ? 1.25 : 1));
      else if (definition.attack === "Dash") {
        dashUntil.set(instance, now + 0.55);
        task.delay(0.55, () => {
          const currentRoot = player.Character?.FindFirstChild("HumanoidRootPart");
          if (
            currentRoot?.IsA("BasePart") &&
            currentRoot.Position.sub(root.Position).Magnitude <= 7
          )
            callbacks.damagePlayer(player, definition.damage);
        });
      } else if (definition.attack === "Spike")
        spikeAttack(targetRoot.Position, definition, callbacks);
      else if (definition.attack === "Nova") novaAttack(root.Position, definition, callbacks);
      else
        rangedAttack(
          root,
          targetRoot,
          enraged
            ? { ...definition, projectileCount: (definition.projectileCount ?? 1) + 3 }
            : definition,
          callbacks,
        );
      if (enraged) cooldowns.set(instance, now + definition.cooldown * 0.7);
    }
  });
}
