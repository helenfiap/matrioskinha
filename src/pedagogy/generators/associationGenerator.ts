import { pedagogicalEntityRepository } from '../adapters';
import { entityRefKey, type LearningInteraction } from '../contracts';
import { deterministicOrder } from './deterministic';
import type { GeneratorInput, SkillGenerator } from './generatorTypes';
import { interactionBase } from './interactionFactory';

export class AssociationGenerator implements SkillGenerator {
  readonly id = 'association-v1';

  canGenerate(entity: GeneratorInput['entity']): boolean {
    return entity.relationRefs.some((ref) => pedagogicalEntityRepository.has(ref));
  }

  generate(input: GeneratorInput): LearningInteraction {
    if (input.entity.ref.type === 'emotion') return this.generateEmotionExpressionAssociation(input);
    const relations = deterministicOrder(
      input.entity.relationRefs.map((ref) => pedagogicalEntityRepository.get(ref)).filter((item) => item !== undefined),
      `${input.seed}:relation:${input.sequence}`,
      (item) => entityRefKey(item.ref),
    );
    const correct = relations[0];
    if (!correct) throw new Error(`Sem relação resolvível para ${entityRefKey(input.entity.ref)}.`);
    const distractors = deterministicOrder(
      pedagogicalEntityRepository.list(correct.ref.type).filter((item) =>
        entityRefKey(item.ref) !== entityRefKey(correct.ref)
        && !input.entity.relationRefs.some((ref) => entityRefKey(ref) === entityRefKey(item.ref))),
      `${input.seed}:association-options:${input.sequence}`,
      (item) => entityRefKey(item.ref),
    ).slice(0, 3);
    const options = deterministicOrder([correct, ...distractors], `${input.seed}:association-shuffle:${input.sequence}`, (item) => entityRefKey(item.ref))
      .map((item) => ({ id: entityRefKey(item.ref), label: item.label, entityRef: item.ref }));
    return {
      ...interactionBase(input, this.id, 'association', {
        pt: `Qual elemento está relacionado a “${input.entity.label.pt}”?`,
        ru: `Какой элемент связан с «${input.entity.label.ru}»?`,
      }),
      answerSpec: { kind: 'single-choice', options, correctOptionId: entityRefKey(correct.ref) },
      nextRecommendation: { skill: 'recognition', entityRef: correct.ref },
    };
  }

  private generateEmotionExpressionAssociation(input: GeneratorInput): LearningInteraction {
    const relatedExpressions = deterministicOrder(
      input.entity.relationRefs
        .filter((ref) => ref.type === 'phrase')
        .map((ref) => pedagogicalEntityRepository.get(ref))
        .filter((item) => item !== undefined)
        .filter((item) => item.metadata.kind === 'emotion-expression'),
      `${input.seed}:emotion-expression:${input.sequence}`,
      (item) => entityRefKey(item.ref),
    );
    const correct = relatedExpressions[0];
    if (!correct) throw new Error(`Mood sem expressão relacionada: ${input.entity.ref.id}.`);
    const relatedKeys = new Set(relatedExpressions.map((item) => entityRefKey(item.ref)));
    const distractors = deterministicOrder(
      pedagogicalEntityRepository.list('phrase').filter((item) =>
        item.metadata.kind === 'emotion-expression'
        && item.metadata.moodId !== input.entity.ref.id
        && !relatedKeys.has(entityRefKey(item.ref))),
      `${input.seed}:emotion-expression-distractors:${input.sequence}`,
      (item) => entityRefKey(item.ref),
    ).slice(0, 3);
    const options = deterministicOrder(
      [correct, ...distractors], `${input.seed}:emotion-expression-shuffle:${input.sequence}`,
      (item) => entityRefKey(item.ref),
    ).map((item) => ({ id: entityRefKey(item.ref), label: item.label, entityRef: item.ref }));
    const feminine = input.context.selectedGender !== 'masculine';
    const moodLabelPt = input.entity.label.pt.split(' / ')[feminine ? 0 : 1] ?? input.entity.label.pt;
    const moodLabelRu = input.entity.label.ru.split(' / ')[feminine ? 0 : 1] ?? input.entity.label.ru;
    const base = interactionBase(input, this.id, 'association', {
      pt: `Qual expressão combina com “${moodLabelPt}”?`,
      ru: `Какое выражение подходит к эмоции «${moodLabelRu}»?`,
    });
    return {
      ...base,
      tags: [...base.tags, 'emotion-expressions'],
      answerSpec: { kind: 'single-choice', options, correctOptionId: entityRefKey(correct.ref) },
      nextRecommendation: { skill: 'application', entityRef: correct.ref },
    };
  }
}

export const associationGenerator = new AssociationGenerator();
