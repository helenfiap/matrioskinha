import type { Attempt } from '../content/schemas';
import type { ItemProgress } from './progress';

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

const INTERVALS = [0, 0, 1, 3, 7, 14, 30] as const;

function isoDate(date: Date): string { return date.toISOString().slice(0, 10); }

function addDays(date: Date, days: number): string {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return isoDate(next);
}

export function scheduleReview(current: ItemProgress, rating: ReviewRating, now = new Date()): ItemProgress {
  const currentIndex = Math.max(1, current.intervalIndex);
  const nextIndex = rating === 'again'
    ? 1
    : rating === 'hard'
      ? Math.max(1, currentIndex)
      : Math.min(6, currentIndex + (rating === 'easy' ? 2 : 1));
  const days = rating === 'again' ? 0 : rating === 'hard' ? 1 : INTERVALS[nextIndex];
  return {
    intervalIndex: nextIndex,
    nextReviewDate: addDays(now, days),
    lastReviewedAt: now.toISOString(),
    lapses: (current.lapses ?? 0) + (rating === 'again' ? 1 : 0),
  };
}

export interface MasteryEvidence {
  itemId: string;
  attempts: number;
  correct: number;
  independentCorrect: number;
  accuracy: number;
  modalities: Attempt['modality'][];
  score: number;
  mastered: boolean;
  lastAttemptAt: string;
}

export function calculateMastery(attempts: readonly Attempt[]): MasteryEvidence[] {
  const grouped = new Map<string, Attempt[]>();
  for (const attempt of attempts) grouped.set(attempt.itemId, [...(grouped.get(attempt.itemId) ?? []), attempt]);
  return [...grouped.entries()].map(([itemId, itemAttempts]) => {
    const correct = itemAttempts.filter((attempt) => attempt.correct).length;
    const independentCorrect = itemAttempts.filter((attempt) => attempt.correct && !attempt.usedSupportLanguage).length;
    const modalities = [...new Set(itemAttempts.filter((attempt) => attempt.correct).map((attempt) => attempt.modality))];
    const accuracy = correct / itemAttempts.length;
    const breadth = Math.min(1, modalities.length / 3);
    const independence = correct ? independentCorrect / correct : 0;
    const score = Math.round((accuracy * 0.5 + breadth * 0.3 + independence * 0.2) * 100) / 100;
    return {
      itemId, attempts: itemAttempts.length, correct, independentCorrect, accuracy,
      modalities, score,
      mastered: correct >= 4 && accuracy >= 0.8 && modalities.length >= 2 && independentCorrect >= 2,
      lastAttemptAt: itemAttempts.map((attempt) => attempt.answeredAt).sort().at(-1)!,
    };
  });
}

export interface LearningMetrics {
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number | null;
  supportFreeRate: number | null;
  averageDurationMs: number | null;
  masteredItems: number;
  modalityAccuracy: Partial<Record<Attempt['modality'], number>>;
}

export function calculateLearningMetrics(attempts: readonly Attempt[]): LearningMetrics {
  if (!attempts.length) return {
    totalAttempts: 0, correctAttempts: 0, accuracy: null, supportFreeRate: null,
    averageDurationMs: null, masteredItems: 0, modalityAccuracy: {},
  };
  const correctAttempts = attempts.filter((attempt) => attempt.correct).length;
  const modalityAccuracy: LearningMetrics['modalityAccuracy'] = {};
  for (const modality of new Set(attempts.map((attempt) => attempt.modality))) {
    const subset = attempts.filter((attempt) => attempt.modality === modality);
    modalityAccuracy[modality] = subset.filter((attempt) => attempt.correct).length / subset.length;
  }
  return {
    totalAttempts: attempts.length,
    correctAttempts,
    accuracy: correctAttempts / attempts.length,
    supportFreeRate: attempts.filter((attempt) => !attempt.usedSupportLanguage).length / attempts.length,
    averageDurationMs: Math.round(attempts.reduce((sum, attempt) => sum + attempt.durationMs, 0) / attempts.length),
    masteredItems: calculateMastery(attempts).filter((item) => item.mastered).length,
    modalityAccuracy,
  };
}

export interface RecurringError {
  key: string;
  itemId: string;
  exerciseTemplateId?: string;
  errorCode?: string;
  count: number;
  lastOccurredAt: string;
}

export function findRecurringErrors(attempts: readonly Attempt[]): RecurringError[] {
  const grouped = new Map<string, RecurringError>();
  for (const attempt of attempts.filter((candidate) => !candidate.correct)) {
    const key = [attempt.itemId, attempt.exerciseTemplateId ?? '', attempt.errorCode ?? 'incorrect'].join(':');
    const current = grouped.get(key);
    grouped.set(key, {
      key, itemId: attempt.itemId, exerciseTemplateId: attempt.exerciseTemplateId,
      errorCode: attempt.errorCode, count: (current?.count ?? 0) + 1,
      lastOccurredAt: current && current.lastOccurredAt > attempt.answeredAt ? current.lastOccurredAt : attempt.answeredAt,
    });
  }
  return [...grouped.values()].sort((a, b) => b.count - a.count || b.lastOccurredAt.localeCompare(a.lastOccurredAt));
}
