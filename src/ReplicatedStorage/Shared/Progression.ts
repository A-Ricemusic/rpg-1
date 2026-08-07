import {
  ABILITIES,
  BASE_HEALTH,
  BASE_MAGICKA,
  BASE_STAMINA,
  LEVEL_CAP,
  xpForNextLevel,
} from "./GameConfig";
import { AbilityDefinition, PlayerProgress } from "./GameTypes";

export interface XpResult {
  readonly progress: PlayerProgress;
  readonly unlocked: readonly AbilityDefinition[];
}

export function createProgress(): PlayerProgress {
  const first = ABILITIES[0];
  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    maxHealth: BASE_HEALTH + (first.stat === "maxHealth" ? first.bonus : 0),
    maxMagicka: BASE_MAGICKA + (first.stat === "maxMagicka" ? first.bonus : 0),
    maxStamina: BASE_STAMINA + (first.stat === "maxStamina" ? first.bonus : 0),
    questIndex: 0,
    questActive: false,
  };
}

export function grantXp(progress: PlayerProgress, amount: number): XpResult {
  const grantedXp = amount === amount && amount < math.huge ? math.max(0, amount) : 0;
  let level = progress.level;
  let xp = progress.xp + grantedXp;
  let maxHealth = progress.maxHealth;
  let maxMagicka = progress.maxMagicka;
  let maxStamina = progress.maxStamina;
  const unlocked = new Array<AbilityDefinition>();

  while (level < LEVEL_CAP && xp >= xpForNextLevel(level)) {
    xp -= xpForNextLevel(level);
    level += 1;
    const ability = ABILITIES[level - 1];
    unlocked.push(ability);
    if (ability.stat === "maxHealth") maxHealth += ability.bonus;
    else if (ability.stat === "maxMagicka") maxMagicka += ability.bonus;
    else maxStamina += ability.bonus;
  }

  if (level === LEVEL_CAP) xp = 0;
  return {
    progress: {
      ...progress,
      level,
      xp,
      totalXp: progress.totalXp + grantedXp,
      maxHealth,
      maxMagicka,
      maxStamina,
    },
    unlocked,
  };
}
