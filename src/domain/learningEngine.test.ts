import { describe, expect, it } from 'vitest';
import type { Attempt } from '../content/schemas';
import { calculateLearningMetrics, calculateMastery, findRecurringErrors, scheduleReview } from './learningEngine';

function attempt(overrides: Partial<Attempt> = {}): Attempt {
  return {
    id: 'attempt-1', userId: 'local-user', itemId: 'lex-sofa', itemType: 'lexical-item',
    modality: 'reading', correct: true, usedSupportLanguage: false,
    answeredAt: '2026-07-15T12:00:00.000Z', durationMs: 1000, ...overrides,
  };
}

describe('Learning Engine', () => {
  it('agenda acerto, facilidade e falha sem misturar domínio', () => {
    const now = new Date('2026-07-15T12:00:00.000Z');
    const state = { intervalIndex: 1, nextReviewDate: '2026-07-15' };
    expect(scheduleReview(state, 'good', now)).toMatchObject({ intervalIndex: 2, nextReviewDate: '2026-07-16', lapses: 0 });
    expect(scheduleReview(state, 'easy', now)).toMatchObject({ intervalIndex: 3, nextReviewDate: '2026-07-18' });
    expect(scheduleReview({ ...state, intervalIndex: 4 }, 'hard', now)).toMatchObject({ intervalIndex: 4, nextReviewDate: '2026-07-16' });
    expect(scheduleReview({ ...state, lapses: 2 }, 'again', now)).toMatchObject({ intervalIndex: 1, nextReviewDate: '2026-07-15', lapses: 3 });
  });

  it('exige múltiplas evidências independentes para domínio', () => {
    const attempts = [
      attempt({ id: 'a-1', modality: 'reading' }),
      attempt({ id: 'a-2', modality: 'reading' }),
      attempt({ id: 'a-3', modality: 'listening', usedSupportLanguage: true }),
      attempt({ id: 'a-4', modality: 'listening', usedSupportLanguage: true }),
    ];
    const [mastery] = calculateMastery(attempts);
    expect(mastery).toMatchObject({ correct: 4, independentCorrect: 2, mastered: true });
    expect(mastery.modalities).toEqual(['reading', 'listening']);
    expect(calculateMastery(attempts.slice(0, 3))[0].mastered).toBe(false);
  });

  it('calcula métricas reais por modalidade', () => {
    expect(calculateLearningMetrics([])).toMatchObject({ totalAttempts: 0, accuracy: null });
    const metrics = calculateLearningMetrics([
      attempt({ id: 'a-1', durationMs: 1000 }),
      attempt({ id: 'a-2', modality: 'listening', correct: false, usedSupportLanguage: true, durationMs: 3000 }),
    ]);
    expect(metrics).toMatchObject({ totalAttempts: 2, correctAttempts: 1, accuracy: 0.5, supportFreeRate: 0.5, averageDurationMs: 2000 });
    expect(metrics.modalityAccuracy).toEqual({ reading: 1, listening: 0 });
  });

  it('agrupa e ordena erros recorrentes', () => {
    const errors = findRecurringErrors([
      attempt({ id: 'a-1', correct: false, exerciseTemplateId: 'exercise-order', errorCode: 'word-order' }),
      attempt({ id: 'a-2', correct: false, exerciseTemplateId: 'exercise-order', errorCode: 'word-order', answeredAt: '2026-07-16T12:00:00.000Z' }),
      attempt({ id: 'a-3', itemId: 'lex-cama', correct: false, errorCode: 'recall' }),
      attempt({ id: 'a-4', correct: true }),
    ]);
    expect(errors[0]).toMatchObject({ itemId: 'lex-sofa', count: 2, lastOccurredAt: '2026-07-16T12:00:00.000Z' });
    expect(errors).toHaveLength(2);
  });
});
