import { beforeEach, describe, expect, it } from 'vitest';
import { preferencesRepository } from './preferencesRepository';
import { progressRepository } from './progressRepository';
import { attemptRepository } from './attemptRepository';

describe('storage repositories', () => {
  beforeEach(() => window.localStorage.clear());

  it('persiste somente idiomas válidos', () => {
    expect(preferencesRepository.readLanguage()).toBe('pt');
    preferencesRepository.writeLanguage('ru');
    expect(preferencesRepository.readLanguage()).toBe('ru');
    window.localStorage.setItem('matrioskinha-lang', 'xx');
    expect(preferencesRepository.readLanguage()).toBe('pt');
  });

  it('valida a versão do progresso antes de ler', () => {
    window.localStorage.setItem('matrioskinha-progress', JSON.stringify({ schemaVersion: 1 }));
    expect(progressRepository.read()).toBeNull();
    expect(progressRepository.readRaw()).toEqual({ schemaVersion: 1 });
  });

  it('ignora JSON corrompido e permite limpeza', () => {
    window.localStorage.setItem('matrioskinha-progress', '{');
    expect(progressRepository.readRaw()).toBeNull();
    progressRepository.clear();
    expect(window.localStorage.getItem('matrioskinha-progress')).toBeNull();
  });

  it('valida e limita o log de tentativas', () => {
    const base = {
      userId: 'local-user', itemId: 'phase-3', itemType: 'lesson' as const,
      modality: 'context' as const, correct: true, usedSupportLanguage: false,
      answeredAt: '2026-07-15T12:00:00.000Z', durationMs: 100,
    };
    attemptRepository.write(Array.from({ length: 1002 }, (_, index) => ({ ...base, id: `attempt-${index}` })));
    expect(attemptRepository.read()).toHaveLength(1000);
    expect(attemptRepository.read()[0].id).toBe('attempt-2');
    window.localStorage.setItem('matrioskinha-attempts', '{');
    expect(attemptRepository.read()).toEqual([]);
    attemptRepository.clear();
  });
});
