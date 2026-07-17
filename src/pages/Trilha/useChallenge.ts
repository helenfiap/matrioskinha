export type { ChallengeKey } from '../../types';
import { useCallback, useRef } from 'react';
import { useProgress } from '../../context/ProgressContext';
import { useLearning } from '../../context/LearningContext';
import type { ChallengeKey } from '../../types';

const modalities = {
  choice: 'context', flash: 'visual', order: 'writing', listen: 'listening', registro: 'context',
} as const;

export function useChallenge() {
  const { challengeDone, markChallengeComplete, challengeDoneCount, challengeTotal, settings } = useProgress();
  const { recordAttempt } = useLearning();
  const startedAt = useRef<Record<ChallengeKey, number>>({
    choice: Date.now(), flash: Date.now(), order: Date.now(), listen: Date.now(), registro: Date.now(),
  });
  const recordAnswer = useCallback((key: ChallengeKey, correct: boolean, errorCode?: string) => {
    recordAttempt({
      itemId: 'phase-3', itemType: 'lesson', exerciseTemplateId: `exercise-${key}`,
      modality: modalities[key], correct, usedSupportLanguage: settings.supportLang,
      durationMs: Math.max(0, Date.now() - startedAt.current[key]), errorCode,
    });
    if (correct) {
      markChallengeComplete(key);
      startedAt.current[key] = Date.now();
    }
  }, [markChallengeComplete, recordAttempt, settings.supportLang]);
  const frac = challengeDoneCount / challengeTotal;
  return { items: challengeDone, recordAnswer, done: challengeDoneCount, total: challengeTotal, frac };
}
