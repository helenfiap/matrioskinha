import { pedagogicalEntityRepository } from '../adapters';
import { entityRefKey, type LearningInteraction } from '../contracts';
import { deterministicOrder } from './deterministic';
import type { GeneratorInput, SkillGenerator } from './generatorTypes';
import { interactionBase } from './interactionFactory';

export class RecognitionGenerator implements SkillGenerator {
  readonly id = 'recognition-v1';

  canGenerate(input: GeneratorInput['entity']): boolean {
    return pedagogicalEntityRepository.list(input.ref.type).length >= 2;
  }

  generate(input: GeneratorInput): LearningInteraction {
    const distractors = deterministicOrder(
      pedagogicalEntityRepository.list(input.entity.ref.type).filter((item) => entityRefKey(item.ref) !== entityRefKey(input.entity.ref)),
      `${input.seed}:recognition:${input.sequence}`,
      (item) => entityRefKey(item.ref),
    ).slice(0, 3);
    const options = deterministicOrder([input.entity, ...distractors], `${input.seed}:options:${input.sequence}`, (item) => entityRefKey(item.ref))
      .map((item) => ({ id: entityRefKey(item.ref), label: item.label, entityRef: item.ref }));
    const assets = input.entity.ref.type === 'emotion' && input.context.selectedGender
      ? (() => {
        const feminine = input.context.selectedGender === 'feminine';
        const imageRole = feminine ? 'matrioskinha' : 'misha';
        const audioRole = feminine ? 'adjective-feminine' : 'adjective-masculine';
        const spokenLabel = input.entity.label.pt.split(' / ')[feminine ? 0 : 1] ?? input.entity.label.pt;
        return input.entity.assets.filter((asset) =>
          (asset.type === 'image' && asset.role === imageRole) || (asset.type === 'audio' && asset.role === audioRole))
          .map((asset) => asset.type === 'audio' ? { ...asset, role: `primary-pronunciation:${spokenLabel}` } : asset);
      })()
      : input.entity.assets.filter((asset) => asset.status === 'validated');
    return {
      ...interactionBase(input, this.id, 'recognition', {
        pt: `Qual opção em português corresponde a “${input.entity.label.ru}”?`,
        ru: `Какой вариант на португальском соответствует «${input.entity.label.ru}»?`,
      }),
      assets,
      answerSpec: { kind: 'single-choice', options, correctOptionId: entityRefKey(input.entity.ref) },
    };
  }
}

export const recognitionGenerator = new RecognitionGenerator();
