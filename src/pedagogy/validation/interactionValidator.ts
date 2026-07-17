import { pedagogicalEntityRepository } from '../adapters';
import type { LearningInteraction } from '../contracts';
import { learningInteractionSchema } from './interactionSchemas';

export function validateInteraction(input: unknown): LearningInteraction {
  const interaction = learningInteractionSchema.parse(input);
  interaction.sourceEntityRefs.forEach((ref) => {
    if (!pedagogicalEntityRepository.has(ref)) throw new Error(`Interação referencia entidade ausente: ${ref.type}:${ref.id}`);
  });
  const recommendation = interaction.nextRecommendation?.entityRef;
  if (recommendation && !pedagogicalEntityRepository.has(recommendation)) {
    throw new Error(`Recomendação referencia entidade ausente: ${recommendation.type}:${recommendation.id}`);
  }
  interaction.assets?.forEach((asset) => {
    if (asset.status !== 'validated') throw new Error(`Interação recebeu asset não validado: ${asset.id}`);
  });
  return interaction;
}
