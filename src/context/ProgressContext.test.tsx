import type { PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgressProvider, useProgress } from './ProgressContext';
import { LearningProvider, useLearning } from './LearningContext';

const STORAGE_KEY = 'matrioskinha-progress';

function wrapper({ children }: PropsWithChildren) {
  return <LearningProvider><ProgressProvider>{children}</ProgressProvider></LearningProvider>;
}

describe('ProgressProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T12:00:00-03:00'));
    window.localStorage.clear();
  });

  it('leva um item de novo para explorado e o coloca na fila de hoje', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });

    expect(result.current.getStage('sala', 'sofa')).toBe('novo');

    act(() => result.current.markReviewed('sala', 'sofa'));

    expect(result.current.getStage('sala', 'sofa')).toBe('explorado');
    expect(result.current.pendingReview).toContainEqual({
      sceneId: 'sala',
      hotspotId: 'sofa',
      stage: 'explorado',
    });
    expect(result.current.sceneCounts.sala.reviewed).toBe(1);
  });

  it('avanca a revisao e agenda o proximo intervalo', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });

    act(() => result.current.markReviewed('sala', 'sofa'));
    act(() => result.current.advanceReview('sala', 'sofa'));

    expect(result.current.getStageInfo('sala', 'sofa')).toEqual({
      intervalIndex: 2,
      nextReviewDate: '2026-07-16',
      lastReviewedAt: '2026-07-15T15:00:00.000Z',
      lapses: 0,
    });
    expect(result.current.pendingReview).not.toContainEqual(expect.objectContaining({ hotspotId: 'sofa' }));

    const persisted = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(persisted.itemProgress.sala.sofa.intervalIndex).toBe(2);
  });

  it('reagenda uma falha para hoje e registra o lapso', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });
    act(() => result.current.markReviewed('sala', 'sofa'));
    act(() => result.current.failReview('sala', 'sofa'));
    expect(result.current.getStageInfo('sala', 'sofa')).toMatchObject({
      intervalIndex: 1, nextReviewDate: '2026-07-15', lapses: 1,
    });
  });

  it('só libera domínio novo quando o Learning Engine possui múltiplas evidências', () => {
    const { result } = renderHook(() => ({ progress: useProgress(), learning: useLearning() }), { wrapper });
    act(() => result.current.progress.markReviewed('sala', 'sofa'));
    for (let index = 0; index < 5; index += 1) act(() => result.current.progress.advanceReview('sala', 'sofa'));
    expect(result.current.progress.getStage('sala', 'sofa')).toBe('revisado');

    const evidence = (modality: 'reading' | 'writing', usedSupportLanguage: boolean) => ({
      itemId: 'lex-sofa', itemType: 'lexical-item' as const, modality, correct: true,
      usedSupportLanguage, durationMs: 100, answeredAt: '2026-07-15T12:00:00.000Z',
    });
    act(() => {
      result.current.learning.recordAttempt(evidence('reading', false));
      result.current.learning.recordAttempt(evidence('reading', false));
      result.current.learning.recordAttempt(evidence('writing', true));
      result.current.learning.recordAttempt(evidence('writing', true));
    });
    expect(result.current.progress.getStage('sala', 'sofa')).toBe('dominado');
  });

  it('migra progresso binario antigo sem perder itens dominados', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      sceneReviewed: { sala: ['sofa'] },
      sceneMastered: { sala: ['tv'] },
      challengeDone: { choice: true },
      challengeDate: '2026-07-14',
      studyDates: [],
      settings: {},
    }));

    const { result } = renderHook(() => useProgress(), { wrapper });

    expect(result.current.getStage('sala', 'sofa')).toBe('explorado');
    expect(result.current.getStage('sala', 'tv')).toBe('dominado');
    expect(result.current.challengeDone.choice).toBe(false);
  });

  it('registra desafio, missao, configuracao e data de estudo', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });

    act(() => result.current.markChallengeComplete('choice'));
    act(() => result.current.markMissionDone('sala'));
    act(() => result.current.updateSetting('slowAudio', true));

    expect(result.current.challengeDone.choice).toBe(true);
    expect(result.current.challengeDoneCount).toBe(1);
    expect(result.current.missionsDone.sala).toBe(true);
    expect(result.current.settings.slowAudio).toBe(true);
    expect(result.current.streakDays).toBe(1);
  });

  it('remove todo o progresso ao restaurar o estado', () => {
    const { result } = renderHook(() => useProgress(), { wrapper });

    act(() => result.current.markReviewed('sala', 'sofa'));
    act(() => result.current.resetAll());

    expect(result.current.getStage('sala', 'sofa')).toBe('novo');
    expect(result.current.challengeDoneCount).toBe(0);
    expect(result.current.studyDaysThisWeek).toBe(0);
  });
});
