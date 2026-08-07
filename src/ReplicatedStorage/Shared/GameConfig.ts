import { AbilityDefinition, QuestDefinition } from "./GameTypes";

export const LEVEL_CAP = 20;
export const BASE_HEALTH = 100;
export const BASE_MAGICKA = 60;
export const BASE_STAMINA = 80;
export const LASER_DAMAGE = 25;
export const LASER_RANGE = 180;
export const LASER_MAGICKA_COST = 8;
export const ENEMY_KILL_XP = 35;
export const ATTACK_COOLDOWN_SECONDS = 0.3;
export const MAX_ATTACK_ORIGIN_DISTANCE = 12;
export const MAGICKA_REGEN_PER_SECOND = 5;
export const STAMINA_REGEN_PER_SECOND = 9;
export const BLOCK_STAMINA_COST_PER_SECOND = 14;
export const ENEMY_AGGRO_RANGE = 55;
export const ENEMY_ATTACK_RANGE = 6;
export const ENEMY_ATTACK_COOLDOWN_SECONDS = 1.2;

export const QUESTS: readonly QuestDefinition[] = [
  {
    id: "q1",
    name: "The Azure Shard",
    description: "Recover the blue shard.",
    targetId: "azure-shard",
    xpReward: 55,
  },
  {
    id: "q2",
    name: "Ember in the Ash",
    description: "Find the ember crystal.",
    targetId: "ember-crystal",
    xpReward: 65,
  },
  {
    id: "q3",
    name: "Forest Memory",
    description: "Collect the ancient leaf.",
    targetId: "ancient-leaf",
    xpReward: 75,
  },
  {
    id: "q4",
    name: "Sunken Compass",
    description: "Retrieve the lost compass.",
    targetId: "lost-compass",
    xpReward: 85,
  },
  {
    id: "q5",
    name: "Moonlit Ore",
    description: "Claim the moon ore.",
    targetId: "moon-ore",
    xpReward: 95,
  },
  {
    id: "q6",
    name: "The Runed Tablet",
    description: "Recover the runed tablet.",
    targetId: "runed-tablet",
    xpReward: 110,
  },
  {
    id: "q7",
    name: "Stormglass",
    description: "Collect the stormglass prism.",
    targetId: "stormglass",
    xpReward: 125,
  },
  {
    id: "q8",
    name: "Royal Signet",
    description: "Find the forgotten signet.",
    targetId: "royal-signet",
    xpReward: 140,
  },
  {
    id: "q9",
    name: "Dragon Scale",
    description: "Recover the old dragon scale.",
    targetId: "dragon-scale",
    xpReward: 160,
  },
  {
    id: "q10",
    name: "Heart of the Vale",
    description: "Claim the Heart of the Vale.",
    targetId: "vale-heart",
    xpReward: 200,
  },
];

export const ABILITIES: readonly AbilityDefinition[] = [
  {
    level: 1,
    name: "Arc Bolt",
    description: "Fire a focused magic bolt.",
    stat: "maxMagicka",
    bonus: 5,
  },
  {
    level: 2,
    name: "Vital Spark",
    description: "Your life force grows stronger.",
    stat: "maxHealth",
    bonus: 10,
  },
  {
    level: 3,
    name: "Fleet Step",
    description: "Your endurance reserve expands.",
    stat: "maxStamina",
    bonus: 8,
  },
  {
    level: 4,
    name: "Mana Well",
    description: "Deepen your magical reserve.",
    stat: "maxMagicka",
    bonus: 8,
  },
  {
    level: 5,
    name: "Iron Skin",
    description: "Harden your body against danger.",
    stat: "maxHealth",
    bonus: 12,
  },
  {
    level: 6,
    name: "Second Wind",
    description: "Train for longer engagements.",
    stat: "maxStamina",
    bonus: 10,
  },
  {
    level: 7,
    name: "Spellweaver",
    description: "Expand your arcane capacity.",
    stat: "maxMagicka",
    bonus: 10,
  },
  {
    level: 8,
    name: "Battle Vigor",
    description: "Gain greater resilience.",
    stat: "maxHealth",
    bonus: 14,
  },
  {
    level: 9,
    name: "Pathfinder",
    description: "Travel with enduring purpose.",
    stat: "maxStamina",
    bonus: 12,
  },
  {
    level: 10,
    name: "Arcane Surge",
    description: "Unlock a surge of spell power.",
    stat: "maxMagicka",
    bonus: 12,
  },
  {
    level: 11,
    name: "Guardian Heart",
    description: "Stand firm under pressure.",
    stat: "maxHealth",
    bonus: 16,
  },
  {
    level: 12,
    name: "Relentless",
    description: "Push beyond ordinary limits.",
    stat: "maxStamina",
    bonus: 14,
  },
  {
    level: 13,
    name: "Astral Channel",
    description: "Channel the upper currents.",
    stat: "maxMagicka",
    bonus: 14,
  },
  {
    level: 14,
    name: "Titan Blood",
    description: "Your vitality becomes formidable.",
    stat: "maxHealth",
    bonus: 18,
  },
  {
    level: 15,
    name: "Wind Runner",
    description: "Master sustained movement.",
    stat: "maxStamina",
    bonus: 16,
  },
  {
    level: 16,
    name: "Mystic Reservoir",
    description: "Hold tremendous magic.",
    stat: "maxMagicka",
    bonus: 16,
  },
  { level: 17, name: "Unbroken", description: "Refuse to yield.", stat: "maxHealth", bonus: 20 },
  {
    level: 18,
    name: "Endless March",
    description: "Your endurance seems boundless.",
    stat: "maxStamina",
    bonus: 18,
  },
  {
    level: 19,
    name: "Archmage's Gift",
    description: "Master your inner magic.",
    stat: "maxMagicka",
    bonus: 20,
  },
  {
    level: 20,
    name: "Hero of the Vale",
    description: "Reach the height of mortal power.",
    stat: "maxHealth",
    bonus: 25,
  },
];

export function xpForNextLevel(level: number): number {
  return 80 + level * 40;
}
