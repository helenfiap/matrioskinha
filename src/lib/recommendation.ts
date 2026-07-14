import { scenes } from '../data/scenarios';

export type ActionType = 'revisar' | 'praticar' | 'explorar' | 'continuar';

export interface NextAction {
  type: ActionType;
  sceneId?: string;
  count?: number;
  titlePt: string;
  titleRu: string;
  descPt: string;
  descRu: string;
  ctaPt: string;
  ctaRu: string;
  to: string;
}

interface SceneCounts {
  reviewed: number;
  mastered: number;
  total: number;
}

interface RecommendationInput {
  pendingReviewCount: number;
  sceneCounts: Record<string, SceneCounts>;
}

const levelOrder: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };

/**
 * Motor de recomendação determinístico (sem LLM). Responde à pergunta
 * "qual minha próxima ação?" usando só dados que já existem no store de
 * progresso: fila de revisão espaçada > cena bem explorada mas pouco
 * praticada > cena menos explorada (priorizando nível CEFR mais fácil) >
 * fallback genérico. É a versão "burra" (regras fixas) do Learning Engine
 * — o objetivo é que o Dashboard pergunte, em vez de calcular sozinho.
 */
export function getNextBestAction(input: RecommendationInput): NextAction {
  const { pendingReviewCount, sceneCounts } = input;

  if (pendingReviewCount > 0) {
    return {
      type: 'revisar',
      count: pendingReviewCount,
      titlePt: 'Revisão pendente',
      titleRu: 'Ожидает повторение',
      descPt: `Você tem ${pendingReviewCount} ${pendingReviewCount === 1 ? 'item agendado' : 'itens agendados'} para revisar hoje.`,
      descRu: `У тебя ${pendingReviewCount} ${pendingReviewCount === 1 ? 'слово' : 'слов'} запланировано на повторение сегодня.`,
      ctaPt: 'Revisar agora',
      ctaRu: 'Повторить сейчас',
      to: '/progresso?section=revisao',
    };
  }

  const practiceCandidate = scenes
    .map((scene) => ({ scene, counts: sceneCounts[scene.id] }))
    .filter((x): x is { scene: (typeof scenes)[number]; counts: SceneCounts } =>
      !!x.counts && x.counts.reviewed >= 3 && x.counts.mastered < x.counts.reviewed)
    .sort((a, b) => (b.counts.reviewed - b.counts.mastered) - (a.counts.reviewed - a.counts.mastered))[0];

  if (practiceCandidate) {
    const { scene } = practiceCandidate;
    return {
      type: 'praticar',
      sceneId: scene.id,
      titlePt: 'Hora de praticar',
      titleRu: 'Пора попрактиковаться',
      descPt: `Você já explorou vários itens em "${scene.labelPt}" — pratique para avançar de estágio.`,
      descRu: `Ты уже изучил(а) немало предметов в «${scene.labelRu}» — попрактикуйся, чтобы перейти на следующий этап.`,
      ctaPt: 'Praticar agora',
      ctaRu: 'Практиковать сейчас',
      to: `/cenarios?scene=${scene.id}`,
    };
  }

  const exploreCandidate = scenes
    .map((scene) => {
      const counts = sceneCounts[scene.id];
      const frac = counts && counts.total ? counts.reviewed / counts.total : 0;
      return { scene, frac };
    })
    .filter((x) => x.frac < 1)
    .sort((a, b) => {
      const byLevel = (levelOrder[a.scene.level] ?? 9) - (levelOrder[b.scene.level] ?? 9);
      if (byLevel !== 0) return byLevel;
      return a.frac - b.frac;
    })[0];

  if (exploreCandidate) {
    const { scene } = exploreCandidate;
    return {
      type: 'explorar',
      sceneId: scene.id,
      titlePt: 'Novo vocabulário te espera',
      titleRu: 'Тебя ждёт новая лексика',
      descPt: `Explore a cena "${scene.labelPt}" (${scene.level}) e descubra vocabulário novo.`,
      descRu: `Изучи сцену «${scene.labelRu}» (${scene.level}) и открой новую лексику.`,
      ctaPt: 'Explorar cena',
      ctaRu: 'Изучить сцену',
      to: `/cenarios?scene=${scene.id}`,
    };
  }

  return {
    type: 'continuar',
    titlePt: 'Tudo em dia por aqui!',
    titleRu: 'Здесь всё готово!',
    descPt: 'Você explorou e dominou todo o vocabulário disponível. Continue pela trilha pedagógica.',
    descRu: 'Ты изучил(а) и освоил(а) всю доступную лексику. Продолжай по учебной траектории.',
    ctaPt: 'Ir para a trilha',
    ctaRu: 'Перейти к траектории',
    to: '/trilha',
  };
}
