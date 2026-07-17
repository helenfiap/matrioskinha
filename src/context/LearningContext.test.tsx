import type { PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LearningProvider, useLearning } from './LearningContext';

function wrapper({ children }: PropsWithChildren) { return <LearningProvider>{children}</LearningProvider>; }

describe('LearningProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal('crypto', { randomUUID: () => 'attempt-generated' });
  });

  it('registra, deriva métricas e persiste uma tentativa', () => {
    const { result } = renderHook(() => useLearning(), { wrapper });
    act(() => { result.current.recordAttempt({
      itemId: 'phase-3', itemType: 'lesson', exerciseTemplateId: 'exercise-choice',
      modality: 'context', correct: false, usedSupportLanguage: true, durationMs: 1200,
      errorCode: 'register-choice', answeredAt: '2026-07-15T12:00:00.000Z',
    }); });
    expect(result.current.metrics).toMatchObject({ totalAttempts: 1, accuracy: 0 });
    expect(result.current.recurringErrors[0]).toMatchObject({ errorCode: 'register-choice', count: 1 });
    expect(JSON.parse(window.localStorage.getItem('matrioskinha-attempts') ?? '{}').attempts).toHaveLength(1);
  });

  it('limpa o histórico', () => {
    const { result } = renderHook(() => useLearning(), { wrapper });
    act(() => { result.current.resetAttempts(); });
    expect(result.current.attempts).toEqual([]);
  });
});
