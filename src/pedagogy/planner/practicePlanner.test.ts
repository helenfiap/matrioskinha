import { describe, expect, it } from 'vitest';
import { learningInteractionSchema } from '../validation';
import { practicePlanner } from './practicePlanner';
import { pedagogicalEntityRepository } from '../adapters';

describe('PracticePlanner', () => {
  it('gera a mesma sessão para a mesma origem e seed', () => {
    const first = practicePlanner.plan({ type: 'emotion', id: 'surpresa' }, { seed: 'stable-seed' });
    const second = practicePlanner.plan({ type: 'emotion', id: 'surpresa' }, { seed: 'stable-seed' });
    expect(second).toEqual(first);
    expect(first.interactions).toHaveLength(3);
    expect(first.interactions.every((interaction) => learningInteractionSchema.safeParse(interaction).success)).toBe(true);
  });

  it('encadeia mood e verbo relacionado até a conjugação', () => {
    const session = practicePlanner.plan({ type: 'emotion', id: 'surpresa' }, { seed: 'atelier' });
    expect(session.interactions.map((interaction) => interaction.skill)).toEqual(['recognition', 'association', 'conjugation']);
    expect(session.interactions[2].sourceEntityRefs).toEqual(expect.arrayContaining([
      { type: 'emotion', id: 'surpresa' }, expect.objectContaining({ type: 'verb' }),
    ]));
  });

  it('seleciona arte e pronúncia do gênero ativo no Ateliê', () => {
    const session = practicePlanner.plan({ type: 'emotion', id: 'feliz' }, { seed: 'gender', selectedGender: 'masculine' });
    const assets = session.interactions[0].assets ?? [];
    expect(assets.filter((asset) => asset.type === 'image')).toEqual([
      expect.objectContaining({ role: 'misha', src: expect.stringContaining('/misha/feliz.webp') }),
    ]);
    expect(assets.filter((asset) => asset.type === 'audio')).toEqual([
      expect.objectContaining({ role: 'primary-pronunciation:feliz', src: expect.stringContaining('/male/feliz-') }),
    ]);
  });

  it('mantém o reconhecimento monolíngue e pede uma resposta em português', () => {
    const session = practicePlanner.plan({ type: 'emotion', id: 'confiante' }, { seed: 'target-language', selectedGender: 'feminine' });
    const recognition = session.interactions[0];
    expect(recognition.tags).toEqual(expect.arrayContaining(['answer:pt', 'monolingual-context']));
    expect(recognition.prompt.pt).toContain('уверенная / уверенный');
    expect(recognition.prompt.ru).toContain('уверенная / уверенный');
    expect(recognition.prompt.ru).not.toContain('confiante');
  });

  it('associa um mood somente a expressões de emoções e usa outros moods como distratores', () => {
    const session = practicePlanner.plan({ type: 'emotion', id: 'feliz' }, { seed: 'semantic-association', selectedGender: 'feminine' });
    const association = session.interactions[1];
    expect(association.tags).toEqual(expect.arrayContaining(['emotion-expressions', 'monolingual-context', 'answer:pt']));
    expect(association.prompt.pt).toBe('Qual expressão combina com “feliz”?');
    const answerSpec = association.answerSpec;
    if (answerSpec.kind !== 'single-choice') throw new Error('Interação inesperada');
    const entities = answerSpec.options.map((option) => option.entityRef && pedagogicalEntityRepository.get(option.entityRef));
    expect(entities.every((item) => item?.metadata.kind === 'emotion-expression')).toBe(true);
    const correctIndex = answerSpec.options.findIndex((option) => option.id === answerSpec.correctOptionId);
    expect(entities[correctIndex]?.metadata.moodId).toBe('feliz');
    expect(entities.filter((_, index) => index !== correctIndex).every((item) => item?.metadata.moodId !== 'feliz')).toBe(true);
  });

  it('mantém o hotspot como origem durante os três passos', () => {
    const session = practicePlanner.plan({ type: 'scene-occurrence', id: 'transporte:onibus' }, { seed: 'hotspot' });
    expect(session.interactions).toHaveLength(3);
    expect(session.interactions.every((interaction) => interaction.context.origin.id === 'transporte:onibus')).toBe(true);
    expect(session.interactions.map((interaction) => interaction.skill)).toEqual(['recognition', 'association', 'recognition']);
  });

  it('altera a composição determinística quando a seed muda', () => {
    const first = practicePlanner.plan({ type: 'verb', id: 'pegar' }, { seed: 'a' });
    const second = practicePlanner.plan({ type: 'verb', id: 'pegar' }, { seed: 'b' });
    expect(second.id).not.toBe(first.id);
    expect(second.interactions).not.toEqual(first.interactions);
  });
});
