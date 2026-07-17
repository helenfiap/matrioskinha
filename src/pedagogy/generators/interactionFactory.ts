import { entityRefKey, type BilingualText, type LearningInteraction } from '../contracts';
import type { GeneratorInput } from './generatorTypes';
import { hashSeed, stableIdPart } from './deterministic';

export function interactionBase(
  input: GeneratorInput,
  generatorId: string,
  skill: LearningInteraction['skill'],
  prompt: BilingualText,
): Pick<LearningInteraction,
  'id' | 'kind' | 'sourceEntityRefs' | 'generatorId' | 'skill' | 'difficulty' | 'estimatedSeconds'
  | 'dependencies' | 'tags' | 'context' | 'prompt' | 'feedback' | 'provenance'> {
  const originKey = entityRefKey(input.context.origin);
  const sourceEntityRefs = input.entity.ref.type === input.context.origin.type && input.entity.ref.id === input.context.origin.id
    ? [input.entity.ref]
    : [input.context.origin, input.entity.ref];
  return {
    id: `practice:${stableIdPart(originKey)}:${skill}:${input.sequence}:${hashSeed(input.seed).toString(36)}`,
    kind: 'exercise', sourceEntityRefs, generatorId, skill,
    difficulty: Math.min(5, Math.max(1, input.sequence + 1)), estimatedSeconds: 25,
    dependencies: input.sequence === 0 ? [] : [`step:${input.sequence - 1}`],
    // O idioma da interface pode ser russo, mas o objeto de aprendizagem é
    // português: exercícios não exibem uma tradução paralela e todas as
    // alternativas permanecem no idioma-alvo.
    tags: [input.entity.ref.type, 'answer:pt', 'monolingual-context'],
    context: input.context, prompt,
    feedback: {
      correct: { pt: 'Muito bem! A conexão está correta.', ru: 'Отлично! Связь выбрана верно.' },
      incorrect: { pt: 'Observe a relação e tente novamente na revisão.', ru: 'Обрати внимание на связь и повтори её позже.' },
    },
    provenance: 'generated',
  };
}
