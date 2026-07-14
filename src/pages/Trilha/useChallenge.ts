export type { ChallengeKey } from '../../types';
import { useProgress } from '../../context/ProgressContext';

export function useChallenge() {
  const { challengeDone, markChallengeComplete, challengeDoneCount, challengeTotal } = useProgress();
  const frac = challengeDoneCount / challengeTotal;
  return { items: challengeDone, markComplete: markChallengeComplete, done: challengeDoneCount, total: challengeTotal, frac };
}
