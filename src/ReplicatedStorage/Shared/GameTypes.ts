export type StatName = "maxHealth" | "maxMagicka" | "maxStamina";

export interface AbilityDefinition {
  readonly level: number;
  readonly name: string;
  readonly description: string;
  readonly stat: StatName;
  readonly bonus: number;
}

export interface QuestDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly targetId: string;
  readonly xpReward: number;
}

export interface PlayerProgress {
  readonly level: number;
  readonly xp: number;
  readonly totalXp: number;
  readonly maxHealth: number;
  readonly maxMagicka: number;
  readonly maxStamina: number;
  readonly questIndex: number;
  readonly questActive: boolean;
}

export interface PlayerSnapshot extends PlayerProgress {
  readonly currentHealth: number;
  readonly currentMagicka: number;
  readonly currentStamina: number;
}

export type ClientRequest =
  | { readonly kind: "RequestSnapshot" }
  | { readonly kind: "SetQuestActive"; readonly active: boolean }
  | { readonly kind: "PrimaryAttack"; readonly origin: Vector3; readonly direction: Vector3 }
  | { readonly kind: "SetBlocking"; readonly blocking: boolean };

export type ServerEvent =
  | { readonly kind: "Snapshot"; readonly snapshot: PlayerSnapshot }
  | { readonly kind: "QuestCompleted"; readonly questName: string; readonly xp: number }
  | { readonly kind: "LevelUp"; readonly level: number; readonly ability: AbilityDefinition }
  | { readonly kind: "CombatHit"; readonly origin: Vector3; readonly position: Vector3 };
