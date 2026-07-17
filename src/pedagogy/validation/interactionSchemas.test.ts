import { describe, expect, it } from 'vitest';
import { learningInteractionSchema } from './interactionSchemas';

const validInteraction = {
  id: 'interaction:feliz:recognition', kind: 'exercise',
  sourceEntityRefs: [{ type: 'emotion', id: 'feliz' }], generatorId: 'recognition-v1',
  skill: 'recognition', difficulty: 1, estimatedSeconds: 20, dependencies: [], tags: ['emotion'],
  context: {
    origin: { type: 'emotion', id: 'feliz' }, originRoute: '/cenarios?collection=emotions&mood=feliz',
    moodId: 'feliz', selectedGender: 'feminine', supportLanguage: true,
    availableAssets: { audio: true, image: true, scene: false },
  },
  prompt: { pt: 'Qual é a emoção?', ru: 'Какая это эмоция?' },
  answerSpec: {
    kind: 'single-choice',
    options: [
      { id: 'feliz', label: { pt: 'feliz', ru: 'счастливая' } },
      { id: 'triste', label: { pt: 'triste', ru: 'грустная' } },
    ],
    correctOptionId: 'feliz',
  },
  feedback: {
    correct: { pt: 'Muito bem!', ru: 'Отлично!' },
    incorrect: { pt: 'Tente novamente.', ru: 'Попробуйте ещё раз.' },
  },
  provenance: 'generated',
} as const;

describe('learningInteractionSchema', () => {
  it('aceita uma interação versionável e bilíngue completa', () => {
    expect(learningInteractionSchema.safeParse(validInteraction).success).toBe(true);
  });

  it('rejeita alternativa correta fora das opções e ids ambíguos', () => {
    const invalid = structuredClone(validInteraction) as Record<string, any>;
    invalid.answerSpec.options[1].id = 'feliz';
    invalid.answerSpec.correctOptionId = 'ausente';
    expect(learningInteractionSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejeita uma ordem que repete tokens', () => {
    const invalid = {
      ...validInteraction,
      answerSpec: {
        kind: 'ordering',
        tokens: [{ id: 'eu', value: 'Eu' }, { id: 'sinto', value: 'sinto' }],
        correctOrder: ['eu', 'eu'],
      },
    };
    expect(learningInteractionSchema.safeParse(invalid).success).toBe(false);
  });
});
