import { CollectionService, Debris, Players, RunService, Workspace } from "@rbxts/services";
import { ALL_ENEMIES, EnemyDefinition } from "shared/EnemyConfig";

interface EnemyCallbacks {
  readonly damagePlayer: (player: Player, damage: number) => void;
}

const definitions = new Map<string, EnemyDefinition>();
ALL_ENEMIES.forEach((definition) => definitions.set(definition.id, definition));

function clearMeleePath(source: Model, origin: Vector3, target: BasePart): boolean {
  const params = new RaycastParams();
  params.FilterType = Enum.RaycastFilterType.Exclude;
  params.FilterDescendantsInstances = target.Parent ? [source, target.Parent] : [source];
  params.RespectCanCollide = true;
  return Workspace.Raycast(origin, target.Position.sub(origin), params) === undefined;
}

function nearestPlayer(
  origin: Vector3,
  range: number,
  region?: number,
): [Player | undefined, BasePart | undefined, number] {
  let nearest: Player | undefined;
  let nearestRoot: BasePart | undefined;
  let distance = range;
  Players.GetPlayers().forEach((player) => {
    const humanoid = player.Character?.FindFirstChildOfClass("Humanoid");
    const root = player.Character?.FindFirstChild("HumanoidRootPart");
    if (
      (region === undefined || player.GetAttribute("Region") === region) &&
      player.GetAttribute("DivineParent") !== undefined &&
      player.GetAttribute("AtCamp") !== true &&
      humanoid &&
      humanoid.Health > 0 &&
      root?.IsA("BasePart")
    ) {
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
  source: Model,
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
  const raycastParams = new RaycastParams();
  raycastParams.FilterType = Enum.RaycastFilterType.Exclude;
  raycastParams.FilterDescendantsInstances = [source, projectile];
  task.spawn(() => {
    let traveled = 0;
    while (projectile.Parent && traveled < definition.range + 25) {
      const [dt] = RunService.Heartbeat.Wait();
      const step = speed * dt;
      const displacement = direction.mul(step);
      const hit = Workspace.Raycast(projectile.Position, displacement, raycastParams);
      if (hit) {
        const character = hit.Instance.FindFirstAncestorOfClass("Model");
        const player = character ? Players.GetPlayerFromCharacter(character) : undefined;
        if (player) callbacks.damagePlayer(player, definition.damage * damageScale);
        projectile.Destroy();
        return;
      }
      projectile.Position = projectile.Position.add(displacement);
      traveled += step;
    }
    projectile.Destroy();
  });
}

function spikeAttack(
  source: Model,
  targetPosition: Vector3,
  definition: EnemyDefinition,
  callbacks: EnemyCallbacks,
): void {
  const color = Color3.fromRGB(definition.accent[0], definition.accent[1], definition.accent[2]);
  const radius = definition.boss ? 10 : 6;
  const warning = effectPart(
    "DangerTelegraph",
    new Vector3(0.25, radius * 2, radius * 2),
    new Vector3(targetPosition.X, targetPosition.Y - 2.8, targetPosition.Z),
    color,
  );
  warning.Shape = Enum.PartType.Cylinder;
  warning.CFrame = new CFrame(warning.Position).mul(CFrame.Angles(0, 0, math.rad(90)));
  warning.Transparency = 0.35;
  task.delay(definition.boss ? 0.7 : 1, () => {
    if (!warning.Parent) return;
    if (!source.Parent || (source.FindFirstChildOfClass("Humanoid")?.Health ?? 0) <= 0) {
      warning.Destroy();
      return;
    }
    warning.Destroy();
    const spike = effectPart(
      "EnergySpike",
      new Vector3(radius, 18, radius),
      new Vector3(targetPosition.X, targetPosition.Y + 6, targetPosition.Z),
      color,
    );
    spike.Shape = Enum.PartType.Ball;
    Players.GetPlayers().forEach((player) => {
      const root = player.Character?.FindFirstChild("HumanoidRootPart");
      if (
        root?.IsA("BasePart") &&
        math.abs(root.Position.Y - targetPosition.Y) <= 8 &&
        new Vector3(root.Position.X, 0, root.Position.Z).sub(
          new Vector3(targetPosition.X, 0, targetPosition.Z),
        ).Magnitude <= radius
      )
        callbacks.damagePlayer(player, definition.damage);
    });
    Debris.AddItem(spike, 0.35);
  });
}

function novaAttack(
  source: Model,
  origin: Vector3,
  definition: EnemyDefinition,
  callbacks: EnemyCallbacks,
): void {
  const color = Color3.fromRGB(definition.accent[0], definition.accent[1], definition.accent[2]);
  const radius = definition.range;
  const warning = effectPart(
    "NovaTelegraph",
    new Vector3(0.2, radius * 2, radius * 2),
    origin.sub(new Vector3(0, 3, 0)),
    color,
  );
  warning.Shape = Enum.PartType.Cylinder;
  warning.CFrame = new CFrame(origin.X, origin.Y - 3, origin.Z).mul(
    CFrame.Angles(0, 0, math.rad(90)),
  );
  warning.Transparency = 0.55;
  task.delay(0.85, () => {
    if (!warning.Parent) return;
    if (!source.Parent || (source.FindFirstChildOfClass("Humanoid")?.Health ?? 0) <= 0) {
      warning.Destroy();
      return;
    }
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
  const source = root.Parent;
  if (!source?.IsA("Model")) return;
  const count = definition.attack === "Projectile" ? 1 : (definition.projectileCount ?? 3);
  for (let index = 0; index < count; index++) {
    const spread = count === 1 ? 0 : (index - (count - 1) / 2) * 3.5;
    const elevated = definition.attack === "Summon" ? 8 + (index % 3) * 3 : 1.5;
    const origin = root.Position.add(new Vector3(0, elevated, 0));
    const targetPosition = target.Position.add(
      new Vector3(spread, definition.attack === "Summon" ? -2 : 0, 0),
    );
    task.delay(index * 0.1, () => {
      const humanoid = source.FindFirstChildOfClass("Humanoid");
      if (source.Parent && humanoid && humanoid.Health > 0)
        launchProjectile(
          source,
          origin,
          targetPosition,
          definition,
          callbacks,
          count > 5 ? 0.65 : 1,
        );
    });
  }
}

export function startEnemySystem(callbacks: EnemyCallbacks): RBXScriptConnection {
  const cooldowns = new Map<Model, number>();
  const dashUntil = new Map<Model, number>();
  CollectionService.GetInstanceRemovedSignal("Enemy").Connect((instance) => {
    if (instance.IsA("Model")) {
      cooldowns.delete(instance);
      dashUntil.delete(instance);
    }
  });
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
      const stunned = instance.GetAttribute("StunnedUntil");
      if (typeIs(stunned, "number") && stunned > now) continue;
      const region = instance.GetAttribute("AdventureRegion");
      const [player, targetRoot, distance] = nearestPlayer(
        root.Position,
        math.max(70, definition.range + 10),
        typeIs(region, "number") ? region : undefined,
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
          const params = new RaycastParams();
          params.RespectCanCollide = true;
          params.FilterType = Enum.RaycastFilterType.Exclude;
          const excluded: Instance[] = [instance];
          for (const p of Players.GetPlayers()) if (p.Character) excluded.push(p.Character);
          params.FilterDescendantsInstances = excluded;
          const obstruction = Workspace.Raycast(
            root.Position,
            nextPosition.sub(root.Position).mul(3),
            params,
          );
          const groundParams = new RaycastParams();
          groundParams.RespectCanCollide = true;
          const authored = Workspace.FindFirstChild("EldoriaWorld");
          groundParams.FilterType = Enum.RaycastFilterType.Include;
          groundParams.FilterDescendantsInstances = authored
            ? [authored, Workspace.Terrain]
            : [Workspace.FindFirstChild("DemigodTestContent")!];
          const ground = Workspace.Raycast(
            nextPosition.add(new Vector3(0, 15, 0)),
            new Vector3(0, -50, 0),
            groundParams,
          );
          if (
            !obstruction &&
            ground &&
            math.abs(ground.Position.Y + root.Size.Y / 2 - root.Position.Y) < 8
          ) {
            const grounded = new Vector3(
              nextPosition.X,
              ground.Position.Y + root.Size.Y / 2,
              nextPosition.Z,
            );
            instance.PivotTo(
              CFrame.lookAt(
                grounded,
                new Vector3(horizontalTarget.X, grounded.Y, horizontalTarget.Z),
              ),
            );
          }
        }
      }
      if (now < (cooldowns.get(instance) ?? 0) || distance > definition.range) continue;
      if (
        (definition.attack === "Melee" || definition.attack === "Dash") &&
        !clearMeleePath(instance, root.Position, targetRoot)
      )
        continue;
      cooldowns.set(instance, now + definition.cooldown);
      const enraged = definition.boss === true && humanoid.Health / humanoid.MaxHealth <= 0.5;
      if (definition.attack === "Melee")
        callbacks.damagePlayer(player, definition.damage * (enraged ? 1.25 : 1));
      else if (definition.attack === "Dash") {
        dashUntil.set(instance, now + 0.55);
        task.delay(0.55, () => {
          const currentRoot = player.Character?.FindFirstChild("HumanoidRootPart");
          if (
            instance.Parent !== undefined &&
            humanoid.Health > 0 &&
            currentRoot === targetRoot &&
            currentRoot?.IsA("BasePart") &&
            clearMeleePath(instance, root.Position, currentRoot) &&
            currentRoot.Position.sub(root.Position).Magnitude <= 7
          )
            callbacks.damagePlayer(player, definition.damage);
        });
      } else if (definition.attack === "Spike")
        spikeAttack(instance, targetRoot.Position, definition, callbacks);
      else if (definition.attack === "Nova")
        novaAttack(instance, root.Position, definition, callbacks);
      else
        rangedAttack(
          root,
          targetRoot,
          enraged
            ? { ...definition, projectileCount: (definition.projectileCount ?? 1) + 3 }
            : definition,
          callbacks,
        );
      if (definition.id === "null_sovereign" && enraged)
        spikeAttack(instance, targetRoot.Position, definition, callbacks);
      if (enraged) cooldowns.set(instance, now + definition.cooldown * 0.7);
    }
  });
}
