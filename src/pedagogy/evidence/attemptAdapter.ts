import type { Attempt } from '../../content/schemas';
import type { LearningInteraction, PracticeSession } from '../contracts';

export type PedagogicalAttemptInput = Omit<Attempt, 'id' | 'userId' | 'answeredAt'> & { answeredAt?: string };

export function interactionToAttempt(
  session: PracticeSession,
  interaction: LearningInteraction,
  correct: boolean,
  durationMs: number,
): PedagogicalAttemptInput {
  const ref = interaction.sourceEntityRefs.at(-1) ?? session.origin;
  const itemType: Attempt['itemType'] = ref.type === 'verb' || ref.type === 'verb-expression'
    ? 'verb'
    : ref.type === 'emotion'
      ? 'emotion'
      : 'lexical-item';
  const modality: Attempt['modality'] = interaction.skill === 'conjugation'
    ? 'writing'
    : interaction.skill === 'association'
      ? 'context'
      : interaction.assets?.some((asset) => asset.type === 'image')
        ? 'visual'
        : 'reading';
  return {
    itemId: ref.id, itemType, exerciseTemplateId: interaction.generatorId,
    modality, correct, usedSupportLanguage: interaction.context.supportLanguage,
    durationMs: Math.max(0, Math.round(durationMs)),
    ...(correct ? {} : { errorCode: `${interaction.skill}-error` }),
    pedagogy: {
      entityRef: ref, skill: interaction.skill, generatorId: interaction.generatorId,
      interactionId: interaction.id, sessionId: session.id,
    },
  };
}
