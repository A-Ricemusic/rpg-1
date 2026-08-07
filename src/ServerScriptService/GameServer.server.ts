import {
  CollectionService,
  DataStoreService,
  Players,
  ReplicatedStorage,
  RunService,
  Workspace,
} from "@rbxts/services";
import {
  ATTACK_COOLDOWN_SECONDS,
  BLOCK_STAMINA_COST_PER_SECOND,
  ENEMY_AGGRO_RANGE,
  ENEMY_ATTACK_COOLDOWN_SECONDS,
  ENEMY_ATTACK_RANGE,
  ENEMY_KILL_XP,
  LASER_DAMAGE,
  LASER_MAGICKA_COST,
  LASER_RANGE,
  LEVEL_CAP,
  MAGICKA_REGEN_PER_SECOND,
  MAX_ATTACK_ORIGIN_DISTANCE,
  QUESTS,
  STAMINA_REGEN_PER_SECOND,
  xpForNextLevel,
} from "shared/GameConfig";
import { ClientRequest, PlayerProgress, PlayerSnapshot, ServerEvent } from "shared/GameTypes";
import { createProgress, grantXp } from "shared/Progression";
import { completeQuestTarget, setQuestActive } from "shared/QuestProgression";
import { buildDemoWorld } from "./QuestWorldFactory";

interface RuntimeState {
  progress: PlayerProgress;
  magicka: number;
  stamina: number;
  blocking: boolean;
  lastAttack: number;
}

const states = new Map<Player, RuntimeState>();
const enemyCooldowns = new Map<Model, number>();
let store: DataStore | undefined;
if (game.GameId !== 0) {
  const [available, result] = pcall(() => DataStoreService.GetDataStore("RPGProgress_v1"));
  if (available) store = result;
}
const DATASTORE_RETRY_COUNT = 3;
const remotes = new Instance("Folder");
remotes.Name = "RPGRemotes";
remotes.Parent = ReplicatedStorage;
const requestRemote = new Instance("RemoteEvent");
requestRemote.Name = "Request";
requestRemote.Parent = remotes;
const eventRemote = new Instance("RemoteEvent");
eventRemote.Name = "Event";
eventRemote.Parent = remotes;

function sanitizeProgress(value: unknown): PlayerProgress {
  const fresh = createProgress();
  if (!typeIs(value, "table")) return fresh;
  const saved = value as {
    readonly level?: unknown;
    readonly xp?: unknown;
    readonly totalXp?: unknown;
    readonly questIndex?: unknown;
    readonly questActive?: unknown;
  };
  if (!typeIs(saved.level, "number")) return fresh;
  const targetLevel = math.clamp(math.floor(saved.level), 1, LEVEL_CAP);
  let rebuilt = fresh;
  for (let level = 1; level < targetLevel; level++)
    rebuilt = grantXp(rebuilt, xpForNextLevel(level)).progress;
  return {
    ...rebuilt,
    xp:
      targetLevel < LEVEL_CAP && typeIs(saved.xp, "number")
        ? math.clamp(math.floor(saved.xp), 0, xpForNextLevel(targetLevel) - 1)
        : 0,
    totalXp: typeIs(saved.totalXp, "number") ? math.max(0, math.floor(saved.totalXp)) : 0,
    questIndex: typeIs(saved.questIndex, "number")
      ? math.clamp(math.floor(saved.questIndex), 0, QUESTS.size())
      : 0,
    questActive: saved.questActive === true,
  };
}

function loadProgress(player: Player): PlayerProgress {
  if (!store) return createProgress();
  for (let attempt = 1; attempt <= DATASTORE_RETRY_COUNT; attempt++) {
    const [ok, result] = pcall(() => store.GetAsync(`${player.UserId}`));
    if (ok) return sanitizeProgress(result);
    warn(`RPG progress load attempt ${attempt} failed for ${player.UserId}: ${result}`);
    if (attempt < DATASTORE_RETRY_COUNT) task.wait(attempt);
  }
  return createProgress();
}

function saveProgress(player: Player, progress: PlayerProgress): boolean {
  if (!store) return true;
  for (let attempt = 1; attempt <= DATASTORE_RETRY_COUNT; attempt++) {
    const [ok, message] = pcall(() => store.SetAsync(`${player.UserId}`, progress));
    if (ok) return true;
    warn(`RPG progress save attempt ${attempt} failed for ${player.UserId}: ${message}`);
    if (attempt < DATASTORE_RETRY_COUNT) task.wait(attempt);
  }
  return false;
}

function snapshot(player: Player, state: RuntimeState): PlayerSnapshot {
  const humanoid = player.Character?.FindFirstChildOfClass("Humanoid");
  return {
    ...state.progress,
    currentHealth: humanoid?.Health ?? state.progress.maxHealth,
    currentMagicka: state.magicka,
    currentStamina: state.stamina,
  };
}

function syncStateAttributes(player: Player, state: RuntimeState): void {
  player.SetAttribute("RPGLevel", state.progress.level);
  player.SetAttribute("RPGXp", state.progress.xp);
  player.SetAttribute("RPGQuestIndex", state.progress.questIndex);
  player.SetAttribute("RPGQuestActive", state.progress.questActive);
  player.SetAttribute("RPGMagicka", state.magicka);
  player.SetAttribute("RPGStamina", state.stamina);
  player.SetAttribute("RPGBlocking", state.blocking);
}

function sendSnapshot(player: Player): void {
  const state = states.get(player);
  if (state) {
    syncStateAttributes(player, state);
    eventRemote.FireClient(player, {
      kind: "Snapshot",
      snapshot: snapshot(player, state),
    } as ServerEvent);
  }
}

function applyCharacterStats(player: Player): void {
  const state = states.get(player);
  const humanoid = player.Character?.FindFirstChildOfClass("Humanoid");
  if (!state || !humanoid) return;
  humanoid.MaxHealth = state.progress.maxHealth;
  humanoid.Health = humanoid.MaxHealth;
}

function awardXp(player: Player, amount: number): void {
  const state = states.get(player);
  if (!state) return;
  const previous = state.progress;
  const result = grantXp(state.progress, amount);
  state.progress = result.progress;
  if (result.unlocked.size() > 0) {
    state.magicka = math.min(
      state.progress.maxMagicka,
      state.magicka + state.progress.maxMagicka - previous.maxMagicka,
    );
    state.stamina = math.min(
      state.progress.maxStamina,
      state.stamina + state.progress.maxStamina - previous.maxStamina,
    );
    const humanoid = player.Character?.FindFirstChildOfClass("Humanoid");
    if (humanoid) {
      const healthIncrease = state.progress.maxHealth - previous.maxHealth;
      humanoid.MaxHealth = state.progress.maxHealth;
      humanoid.Health = math.min(humanoid.MaxHealth, humanoid.Health + healthIncrease);
    }
  }
  result.unlocked.forEach((ability) =>
    eventRemote.FireClient(player, {
      kind: "LevelUp",
      level: ability.level,
      ability,
    } as ServerEvent),
  );
  sendSnapshot(player);
}

function completeQuest(player: Player, targetId: string): void {
  const state = states.get(player);
  if (!state) return;
  const result = completeQuestTarget(state.progress, targetId);
  if (!result.completed) return;
  state.progress = result.progress;
  eventRemote.FireClient(player, {
    kind: "QuestCompleted",
    questName: result.completed.name,
    xp: result.completed.xpReward,
  } as ServerEvent);
  awardXp(player, result.completed.xpReward);
}

function connectCollectible(instance: Instance): void {
  if (!instance.IsA("BasePart")) return;
  instance.Touched.Connect((part) => {
    const player = Players.GetPlayerFromCharacter(part.Parent);
    const targetId = instance.GetAttribute("QuestTargetId");
    if (player && typeIs(targetId, "string")) completeQuest(player, targetId);
  });
}

function connectEnemy(instance: Instance): void {
  if (!instance.IsA("Model") || instance.GetAttribute("LifecycleConnected") === true) return;
  const humanoid = instance.FindFirstChildOfClass("Humanoid");
  if (!humanoid) return;
  instance.SetAttribute("LifecycleConnected", true);
  const spawnCFrame = instance.GetPivot();
  const template = instance.Clone();
  template.SetAttribute("LifecycleConnected", undefined);
  humanoid.BreakJointsOnDeath = false;
  humanoid.Died.Once(() => {
    enemyCooldowns.delete(instance);
    task.delay(5, () => {
      const parent = instance.Parent;
      if (!parent) return;
      instance.Destroy();
      const replacement = template.Clone();
      replacement.PivotTo(spawnCFrame);
      replacement.Parent = parent;
      CollectionService.AddTag(replacement, "Enemy");
    });
  });
}

function validVector(value: unknown): value is Vector3 {
  return typeIs(value, "Vector3") && value.X === value.X && value.Magnitude < 100000;
}

function attack(player: Player, origin: Vector3, direction: Vector3): void {
  const state = states.get(player);
  const root = player.Character?.FindFirstChild("HumanoidRootPart");
  if (!state || !root?.IsA("BasePart")) {
    player.SetAttribute("LastCombatResult", "Rejected: character unavailable");
    return;
  }
  if (os.clock() - state.lastAttack < ATTACK_COOLDOWN_SECONDS) {
    player.SetAttribute("LastCombatResult", "Rejected: cooldown");
    return;
  }
  if (state.magicka < LASER_MAGICKA_COST) {
    player.SetAttribute("LastCombatResult", "Rejected: magicka");
    return;
  }
  if (
    origin.sub(root.Position).Magnitude > MAX_ATTACK_ORIGIN_DISTANCE ||
    direction.Magnitude < 0.9
  ) {
    player.SetAttribute("LastCombatResult", "Rejected: invalid aim");
    return;
  }
  state.lastAttack = os.clock();
  state.magicka -= LASER_MAGICKA_COST;
  const params = new RaycastParams();
  params.FilterType = Enum.RaycastFilterType.Exclude;
  params.FilterDescendantsInstances = [player.Character!];
  const result = Workspace.Raycast(origin, direction.Unit.mul(LASER_RANGE), params);
  const endPosition = result?.Position ?? origin.add(direction.Unit.mul(LASER_RANGE));
  eventRemote.FireAllClients({ kind: "CombatHit", origin, position: endPosition } as ServerEvent);
  if (result) {
    const model = result.Instance.FindFirstAncestorOfClass("Model");
    const humanoid = model?.FindFirstChildOfClass("Humanoid");
    if (model?.GetAttribute("Enemy") === true && humanoid && humanoid.Health > 0) {
      humanoid.TakeDamage(LASER_DAMAGE);
      player.SetAttribute("LastCombatResult", `Hit: ${model.Name} (${humanoid.Health} HP)`);
      if (humanoid.Health <= 0) {
        const reward = model.GetAttribute("XpReward");
        awardXp(player, typeIs(reward, "number") ? math.max(0, reward) : ENEMY_KILL_XP);
      }
    } else player.SetAttribute("LastCombatResult", `Blocked by: ${result.Instance.GetFullName()}`);
  } else player.SetAttribute("LastCombatResult", "Miss");
  sendSnapshot(player);
}

requestRemote.OnServerEvent.Connect((player, raw: unknown) => {
  if (!typeIs(raw, "table")) return;
  const candidate = raw as { readonly kind?: unknown };
  if (!typeIs(candidate.kind, "string")) return;
  const request = raw as ClientRequest;
  const state = states.get(player);
  if (!state) return;
  if (request.kind === "RequestSnapshot") {
    sendSnapshot(player);
  } else if (request.kind === "SetQuestActive" && typeIs(request.active, "boolean")) {
    state.progress = setQuestActive(state.progress, request.active);
    sendSnapshot(player);
  } else if (request.kind === "SetBlocking" && typeIs(request.blocking, "boolean")) {
    state.blocking = request.blocking;
  } else if (
    request.kind === "PrimaryAttack" &&
    validVector(request.origin) &&
    validVector(request.direction)
  ) {
    attack(player, request.origin, request.direction);
  }
});

Players.PlayerAdded.Connect((player) => {
  const progress = loadProgress(player);
  if (player.Parent !== Players) return;
  states.set(player, {
    progress,
    magicka: progress.maxMagicka,
    stamina: progress.maxStamina,
    blocking: false,
    lastAttack: 0,
  });
  player.CharacterAdded.Connect(() =>
    task.delay(0.2, () => {
      const state = states.get(player);
      if (state) state.blocking = false;
      applyCharacterStats(player);
      sendSnapshot(player);
    }),
  );
  if (player.Character)
    task.defer(() => {
      applyCharacterStats(player);
      sendSnapshot(player);
    });
});

Players.PlayerRemoving.Connect((player) => {
  const state = states.get(player);
  if (state) saveProgress(player, state.progress);
  states.delete(player);
});

game.BindToClose(() => {
  const pendingSaveCount = states.size();
  let completedSaveCount = 0;
  states.forEach((state, player) =>
    task.spawn(() => {
      saveProgress(player, state.progress);
      completedSaveCount += 1;
    }),
  );
  while (completedSaveCount < pendingSaveCount) task.wait();
});

buildDemoWorld();
CollectionService.GetTagged("QuestCollectible").forEach(connectCollectible);
CollectionService.GetInstanceAddedSignal("QuestCollectible").Connect(connectCollectible);
CollectionService.GetTagged("Enemy").forEach(connectEnemy);
CollectionService.GetInstanceAddedSignal("Enemy").Connect(connectEnemy);

let snapshotAccumulator = 0;
RunService.Heartbeat.Connect((dt) => {
  snapshotAccumulator += dt;
  states.forEach((state, player) => {
    state.magicka = math.min(
      state.progress.maxMagicka,
      state.magicka + dt * MAGICKA_REGEN_PER_SECOND,
    );
    if (state.blocking) {
      state.stamina = math.max(0, state.stamina - dt * BLOCK_STAMINA_COST_PER_SECOND);
      if (state.stamina <= 0) state.blocking = false;
    } else {
      state.stamina = math.min(
        state.progress.maxStamina,
        state.stamina + dt * STAMINA_REGEN_PER_SECOND,
      );
    }
    if (snapshotAccumulator >= 0.25) sendSnapshot(player);
  });
  if (snapshotAccumulator >= 0.25) snapshotAccumulator = 0;
  CollectionService.GetTagged("Enemy").forEach((instance) => {
    if (!instance.IsA("Model")) return;
    const humanoid = instance.FindFirstChildOfClass("Humanoid");
    const root = instance.FindFirstChild("HumanoidRootPart");
    if (!humanoid || humanoid.Health <= 0 || !root?.IsA("BasePart")) return;
    let nearest: Player | undefined;
    let distance = ENEMY_AGGRO_RANGE;
    Players.GetPlayers().forEach((player) => {
      const target = player.Character?.FindFirstChild("HumanoidRootPart");
      if (target?.IsA("BasePart")) {
        const candidate = target.Position.sub(root.Position).Magnitude;
        if (candidate < distance) {
          distance = candidate;
          nearest = player;
        }
      }
    });
    const targetRoot = nearest?.Character?.FindFirstChild("HumanoidRootPart");
    if (!nearest || !targetRoot?.IsA("BasePart")) return;
    humanoid.MoveTo(targetRoot.Position);
    const now = os.clock();
    if (distance <= ENEMY_ATTACK_RANGE && now >= (enemyCooldowns.get(instance) ?? 0)) {
      enemyCooldowns.set(instance, now + ENEMY_ATTACK_COOLDOWN_SECONDS);
      const targetHumanoid = nearest.Character?.FindFirstChildOfClass("Humanoid");
      const state = states.get(nearest);
      const damage = instance.GetAttribute("Damage");
      if (targetHumanoid && state && typeIs(damage, "number"))
        targetHumanoid.TakeDamage(math.max(0, damage) * (state.blocking ? 0.25 : 1));
    }
  });
});
