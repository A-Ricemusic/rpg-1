import { QUESTS } from "./GameConfig";
import { PlayerProgress, QuestDefinition } from "./GameTypes";

export interface QuestCompletionResult {
  readonly progress: PlayerProgress;
  readonly completed?: QuestDefinition;
}

export function setQuestActive(progress: PlayerProgress, active: boolean): PlayerProgress {
  if (progress.questIndex >= QUESTS.size()) return { ...progress, questActive: false };
  return { ...progress, questActive: active };
}

export function completeQuestTarget(
  progress: PlayerProgress,
  targetId: string,
): QuestCompletionResult {
  if (!progress.questActive) return { progress };
  const quest = QUESTS[progress.questIndex];
  if (!quest || quest.targetId !== targetId) return { progress };
  return {
    progress: { ...progress, questIndex: progress.questIndex + 1, questActive: false },
    completed: quest,
  };
}
