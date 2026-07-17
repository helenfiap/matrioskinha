import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { scenes } from '../data/scenarios';
import type { ChallengeKey } from '../types';
import type { UserProgress } from '../content/schemas';
import {
  stageForInterval,
  type ItemProgress,
  type SettingsState,
  type StageKey,
} from '../domain/progress';
import { progressRepository } from '../repositories/progressRepository';
import { scheduleReview } from '../domain/learningEngine';
import { useLearning } from './LearningContext';
import { contentRepository } from '../repositories/contentRepository';
import { EMOTION_ATELIER_PROGRESS_ID } from '../data/emotions';

type PersistedShape = UserProgress;

const defaultSettings: SettingsState = {
  supportLang: true,
  autoTranslate: true,
  slowAudio: false,
  region: true,
  weeklyGoal: true,
  reviewNotification: true,
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function defaultState(): PersistedShape {
  return {
    schemaVersion: 2,
    itemProgress: Object.fromEntries(scenes.map((s) => [s.id, {}])),
    challengeDone: { choice: false, flash: false, order: false, listen: false, registro: false },
    challengeDate: todayIso(),
    missionsDone: {},
    studyDates: [],
    settings: defaultSettings,
  };
}

function addDaysIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function migrateLegacy(parsed: any): Record<string, Record<string, ItemProgress>> {
  // migrate from the old binary sceneReviewed/sceneMastered shape, if present
  const result: Record<string, Record<string, ItemProgress>> = Object.fromEntries(scenes.map((s) => [s.id, {}]));
  if (parsed.itemProgress) {
    scenes.forEach((s) => {
      result[s.id] = { ...(parsed.itemProgress[s.id] ?? {}) };
    });
    return result;
  }
  const reviewed: Record<string, string[]> = parsed.sceneReviewed ?? {};
  const mastered: Record<string, string[]> = parsed.sceneMastered ?? {};
  scenes.forEach((s) => {
    const revIds: string[] = reviewed[s.id] ?? [];
    const masIds: string[] = mastered[s.id] ?? [];
    revIds.forEach((id) => {
      result[s.id][id] = { intervalIndex: 1, nextReviewDate: todayIso() };
    });
    masIds.forEach((id) => {
      result[s.id][id] = { intervalIndex: 6, nextReviewDate: addDaysIso(30) };
    });
  });
  return result;
}

function loadState(): PersistedShape {
  const current = progressRepository.read();
  if (current) {
    const base = defaultState();
    const isSameDay = current.challengeDate === todayIso();
    return {
      ...current,
      itemProgress: { ...base.itemProgress, ...current.itemProgress },
      challengeDone: isSameDay ? current.challengeDone : base.challengeDone,
      challengeDate: todayIso(),
    };
  }
  try {
    const parsed = progressRepository.readRaw() as Record<string, any> | null;
    if (!parsed) return defaultState();
    const base = defaultState();
    // o desafio diário é por dia: se a data salva não é hoje, reseta o estado do desafio
    const savedChallengeDate = typeof parsed.challengeDate === 'string' ? parsed.challengeDate : null;
    const isSameDay = savedChallengeDate === todayIso();
    return {
      schemaVersion: 2,
      itemProgress: migrateLegacy(parsed),
      challengeDone: isSameDay
        ? { ...base.challengeDone, ...(parsed.challengeDone ?? {}) }
        : base.challengeDone,
      challengeDate: todayIso(),
      missionsDone: { ...(parsed.missionsDone ?? {}) },
      studyDates: Array.isArray(parsed.studyDates) ? parsed.studyDates : [],
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
    };
  } catch {
    return defaultState();
  }
}

interface ProgressContextValue {
  reviewed: Record<string, Set<string>>;
  mastered: Record<string, Set<string>>;
  getStage: (sceneId: string, hotspotId: string) => StageKey;
  getStageInfo: (sceneId: string, hotspotId: string) => ItemProgress;
  markReviewed: (sceneId: string, hotspotId: string) => void;
  advanceReview: (sceneId: string, hotspotId: string) => void;
  failReview: (sceneId: string, hotspotId: string) => void;
  sceneCounts: Record<string, { reviewed: number; mastered: number; total: number }>;
  pendingReview: Array<{ sceneId: string; hotspotId: string; stage: StageKey }>;
  challengeDone: Record<ChallengeKey, boolean>;
  markChallengeComplete: (key: ChallengeKey) => void;
  challengeDoneCount: number;
  challengeTotal: number;
  missionsDone: Record<string, boolean>;
  markMissionDone: (sceneId: string) => void;
  settings: SettingsState;
  updateSetting: (key: keyof SettingsState, value: boolean) => void;
  streakDays: number;
  studyDaysThisWeek: number;
  weeklyGoalTarget: number;
  resetAll: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { mastery } = useLearning();
  const [state, setState] = useState<PersistedShape>(() => loadState());
  const masteryByItem = useMemo(() => new Map(mastery.map((item) => [item.itemId, item])), [mastery]);

  useEffect(() => {
    progressRepository.write(state);
  }, [state]);

  const touchStudyDate = () => {
    const t = todayIso();
    setState((prev) => (prev.studyDates.includes(t) ? prev : { ...prev, studyDates: [...prev.studyDates, t] }));
  };

  const getStageInfo = (sceneId: string, hotspotId: string): ItemProgress => {
    return state.itemProgress[sceneId]?.[hotspotId] ?? { intervalIndex: 0, nextReviewDate: null };
  };

  const getStage = (sceneId: string, hotspotId: string): StageKey => {
    const progress = getStageInfo(sceneId, hotspotId);
    const scheduledStage = stageForInterval(progress.intervalIndex);
    if (scheduledStage !== 'dominado') return scheduledStage;
    if (sceneId === EMOTION_ATELIER_PROGRESS_ID) return scheduledStage;
    if (!progress.lastReviewedAt) return 'dominado'; // preserva domínio importado do formato legado
    const lexicalItemId = contentRepository.getOccurrence(`${sceneId}:${hotspotId}`)?.lexicalItemId;
    return lexicalItemId && masteryByItem.get(lexicalItemId)?.mastered ? 'dominado' : 'revisado';
  };

  const setItemProgress = (sceneId: string, hotspotId: string, next: ItemProgress) => {
    setState((prev) => ({
      ...prev,
      itemProgress: {
        ...prev.itemProgress,
        [sceneId]: { ...(prev.itemProgress[sceneId] ?? {}), [hotspotId]: next },
      },
    }));
    touchStudyDate();
  };

  // first contact with an item: novo -> explorado, due today
  const markReviewed = (sceneId: string, hotspotId: string) => {
    const current = getStageInfo(sceneId, hotspotId);
    if (current.intervalIndex >= 1) return;
    setItemProgress(sceneId, hotspotId, { intervalIndex: 1, nextReviewDate: todayIso() });
  };

  // one successful review/practice: advance one step on the schedule
  const advanceReview = (sceneId: string, hotspotId: string) => {
    const current = getStageInfo(sceneId, hotspotId);
    setItemProgress(sceneId, hotspotId, scheduleReview(current, 'good'));
  };

  const failReview = (sceneId: string, hotspotId: string) => {
    setItemProgress(sceneId, hotspotId, scheduleReview(getStageInfo(sceneId, hotspotId), 'again'));
  };

  const markChallengeComplete = (key: ChallengeKey) => {
    setState((prev) => (prev.challengeDone[key] ? prev : { ...prev, challengeDone: { ...prev.challengeDone, [key]: true } }));
    touchStudyDate();
  };

  const markMissionDone = (sceneId: string) => {
    setState((prev) => (prev.missionsDone[sceneId] ? prev : { ...prev, missionsDone: { ...prev.missionsDone, [sceneId]: true } }));
    touchStudyDate();
  };

  const updateSetting = (key: keyof SettingsState, value: boolean) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
  };

  const resetAll = () => setState(defaultState());

  // backward-compatible derived views used by SceneStage / hotspot dot coloring
  const reviewed = useMemo(() => {
    const result: Record<string, Set<string>> = {};
    scenes.forEach((s) => {
      result[s.id] = new Set(
        Object.entries(state.itemProgress[s.id] ?? {})
          .filter(([, v]) => v.intervalIndex >= 1)
          .map(([id]) => id)
      );
    });
    return result;
  }, [state.itemProgress]);

  const mastered = useMemo(() => {
    const result: Record<string, Set<string>> = {};
    scenes.forEach((s) => {
      result[s.id] = new Set(
        Object.entries(state.itemProgress[s.id] ?? {})
          .filter(([hotspotId, progress]) => {
            if (stageForInterval(progress.intervalIndex) !== 'dominado') return false;
            if (!progress.lastReviewedAt) return true;
            const lexicalItemId = contentRepository.getOccurrence(`${s.id}:${hotspotId}`)?.lexicalItemId;
            return Boolean(lexicalItemId && masteryByItem.get(lexicalItemId)?.mastered);
          })
          .map(([id]) => id)
      );
    });
    return result;
  }, [state.itemProgress, masteryByItem]);

  const sceneCounts = useMemo(() => {
    const result: Record<string, { reviewed: number; mastered: number; total: number }> = {};
    scenes.forEach((s) => {
      result[s.id] = {
        reviewed: reviewed[s.id]?.size ?? 0,
        mastered: mastered[s.id]?.size ?? 0,
        total: s.hotspots.length,
      };
    });
    return result;
  }, [reviewed, mastered]);

  const pendingReview = useMemo(() => {
    const today = todayIso();
    const list: Array<{ sceneId: string; hotspotId: string; stage: StageKey }> = [];
    scenes.forEach((s) => {
      Object.entries(state.itemProgress[s.id] ?? {}).forEach(([hotspotId, info]) => {
        if (info.intervalIndex >= 1 && info.nextReviewDate && info.nextReviewDate <= today) {
          list.push({ sceneId: s.id, hotspotId, stage: stageForInterval(info.intervalIndex) });
        }
      });
    });
    return list;
  }, [state.itemProgress]);

  const challengeDoneCount = useMemo(
    () => Object.values(state.challengeDone).filter(Boolean).length,
    [state.challengeDone]
  );

  const streakDays = useMemo(() => {
    const set = new Set(state.studyDates);
    let count = 0;
    const cursor = new Date();
    if (!set.has(todayIso())) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (set.has(cursor.toISOString().slice(0, 10))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [state.studyDates]);

  const studyDaysThisWeek = useMemo(() => {
    const set = new Set(state.studyDates);
    let count = 0;
    const cursor = new Date();
    for (let i = 0; i < 7; i++) {
      if (set.has(cursor.toISOString().slice(0, 10))) count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [state.studyDates]);

  const value: ProgressContextValue = {
    reviewed,
    mastered,
    getStage,
    getStageInfo,
    markReviewed,
    advanceReview,
    failReview,
    sceneCounts,
    pendingReview,
    challengeDone: state.challengeDone,
    markChallengeComplete,
    challengeDoneCount,
    challengeTotal: 5,
    missionsDone: state.missionsDone,
    markMissionDone,
    settings: state.settings,
    updateSetting,
    streakDays,
    studyDaysThisWeek,
    weeklyGoalTarget: 5,
    resetAll,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

// oxlint-disable-next-line react/only-export-components -- baseline keeps the provider and its hook colocated; they will be split with the domain-store migration.
export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress deve ser usado dentro de ProgressProvider');
  return ctx;
}
