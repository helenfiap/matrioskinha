import type { UserProgress } from '../content/schemas';

export type SettingsState = UserProgress['settings'];
export type ItemProgress = UserProgress['itemProgress'][string][string];

export const REVIEW_INTERVAL_DAYS = [0, 0, 1, 3, 7, 14, 30] as const;
export const STAGE_KEYS = ['novo', 'explorado', 'reconhecido', 'praticado', 'revisado', 'dominado'] as const;
export type StageKey = (typeof STAGE_KEYS)[number];

export const STAGE_LABELS: Record<StageKey, { pt: string; ru: string }> = {
  novo: { pt: 'Novo', ru: 'Новое' },
  explorado: { pt: 'Explorado', ru: 'Изучено' },
  reconhecido: { pt: 'Reconhecido', ru: 'Узнаётся' },
  praticado: { pt: 'Praticado', ru: 'Отработано' },
  revisado: { pt: 'Revisado', ru: 'Повторено' },
  dominado: { pt: 'Dominado', ru: 'Освоено' },
};

export function stageForInterval(intervalIndex: number): StageKey {
  const table: StageKey[] = ['novo', 'explorado', 'reconhecido', 'praticado', 'revisado', 'revisado', 'dominado'];
  return table[Math.max(0, Math.min(intervalIndex, table.length - 1))];
}
