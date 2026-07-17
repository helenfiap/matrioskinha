import { describe, expect, it } from 'vitest';
import { emotionVocabularyContent } from './emotionVocabulary';
import { conjugatorVerbs, curatedInfinitives } from './verbs';

describe('curadoria canônica de infinitivos', () => {
  it('consolida as fontes em 112 infinitivos sem duplicação', () => {
    expect(curatedInfinitives).toHaveLength(112);
    expect(new Set(curatedInfinitives.map((verb) => verb.pt)).size).toBe(112);
    expect(curatedInfinitives.filter((verb) => verb.hasFullConjugation)).toHaveLength(conjugatorVerbs.length);
    expect(curatedInfinitives.filter((verb) => !verb.hasFullConjugation)).toHaveLength(62);
  });

  it('inclui todos os verbos do Ateliê com seus contextos', () => {
    for (const vocabulary of emotionVocabularyContent) {
      for (const verb of vocabulary.verbs) {
        const curated = curatedInfinitives.find((candidate) => candidate.pt === verb.pt);
        expect(curated).toBeDefined();
        expect(curated?.sources).toContain('emotion');
        expect(curated?.contexts.some((context) => context.kind === 'emotion' && context.id === vocabulary.moodId)).toBe(true);
      }
    }
  });

  it('reaproveita pegar e cruza relaxar entre cenário e emoção', () => {
    const pegar = curatedInfinitives.find((verb) => verb.pt === 'pegar');
    expect(pegar?.hasFullConjugation).toBe(true);
    expect(pegar?.sources).toEqual(expect.arrayContaining(['core', 'scene']));

    const relaxar = curatedInfinitives.find((verb) => verb.pt === 'relaxar');
    expect(relaxar?.sources).toEqual(expect.arrayContaining(['scene', 'emotion']));
  });
});
