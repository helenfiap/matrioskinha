import { describe, expect, it } from 'vitest';
import { emotionVocabularyContent } from './emotionVocabulary';
import { conjugatorVerbs, curatedInfinitives } from './verbs';

describe('curadoria canônica de infinitivos', () => {
  it('consolida as fontes em 112 infinitivos com quadros completos', () => {
    expect(curatedInfinitives).toHaveLength(112);
    expect(conjugatorVerbs).toHaveLength(112);
    expect(new Set(curatedInfinitives.map((verb) => verb.pt)).size).toBe(112);
    expect(curatedInfinitives.filter((verb) => verb.hasFullConjugation)).toHaveLength(conjugatorVerbs.length);
    expect(curatedInfinitives.filter((verb) => !verb.hasFullConjugation)).toHaveLength(0);
    for (const verb of curatedInfinitives) {
      expect(Object.values(verb.forms).every(Boolean), `${verb.pt}: presente em português`).toBe(true);
      expect(Object.values(verb.ruForms).every(Boolean), `${verb.pt}: presente em russo`).toBe(true);
      expect(Object.values(verb.pretPerf ?? {}).every(Boolean), `${verb.pt}: pretérito em português`).toBe(true);
      expect(verb.pretPeritoRu, `${verb.pt}: passado em russo`).toBeDefined();
      expect([
        verb.pretPeritoRu?.masculine,
        verb.pretPeritoRu?.feminine,
        verb.pretPeritoRu?.neuter,
        verb.pretPeritoRu?.plural,
      ].every(Boolean), `${verb.pt}: gênero e número no passado russo`).toBe(true);
    }
  });

  it('preserva exceções portuguesas e pronomes dos reflexivos', () => {
    const byPt = (pt: string) => curatedInfinitives.find((verb) => verb.pt === pt)!;
    expect(byPt('acalmar-se').forms).toMatchObject({ eu: 'me acalmo', nos: 'nos acalmamos' });
    expect(byPt('acalmar-se').pretPerf).toMatchObject({ eu: 'me acalmei', eles: 'se acalmaram' });
    expect(byPt('descobrir').forms.eu).toBe('descubro');
    expect(byPt('descer').forms.eu).toBe('desço');
    expect(byPt('proteger-se').forms.eu).toBe('me protejo');
    expect(byPt('reagir').forms.eu).toBe('reajo');
    expect(byPt('sorrir').forms).toMatchObject({ eu: 'sorrio', voce: 'sorri', eles: 'sorriem' });
    expect(byPt('pagar').pretPerf?.eu).toBe('paguei');
  });

  it('amarra áudio somente ao lema efetivamente narrado', () => {
    const withAudio = curatedInfinitives.filter((verb) => verb.infinitiveAudio);
    expect(withAudio).toHaveLength(67);
    expect(curatedInfinitives.find((verb) => verb.pt === 'acalmar-se')?.infinitiveAudio).toEqual({
      kind: 'emotion', text: 'acalmar-se', voiceRole: 'female',
    });
    expect(curatedInfinitives.find((verb) => verb.pt === 'relaxar')?.infinitiveAudio).toBeDefined();
    expect(curatedInfinitives.find((verb) => verb.pt === 'sentir')?.infinitiveAudio).toBeUndefined();
    expect(curatedInfinitives.find((verb) => verb.pt === 'tomar')?.infinitiveAudio).toBeUndefined();
  });

  it('inclui todos os verbos do Ateliê com seus contextos', () => {
    for (const vocabulary of emotionVocabularyContent) {
      for (const verb of vocabulary.verbs) {
        const expectedLemma = verb.pt === 'sentir saudade' ? 'sentir' : verb.pt;
        const curated = curatedInfinitives.find((candidate) => candidate.pt === expectedLemma);
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

  it('liga sentir somente à construção infinitiva narrada', () => {
    expect(curatedInfinitives.some((verb) => verb.pt === 'sentir saudade')).toBe(false);
    const sentir = curatedInfinitives.find((verb) => verb.pt === 'sentir');
    expect(sentir?.group).toBe('ir');
    expect(sentir?.relatedExpressions).toEqual([expect.objectContaining({
      pt: 'sentir saudade',
      form: 'infinitive',
      audio: { kind: 'emotion', text: 'sentir saudade', voiceRole: 'female' },
    })]);
  });

  it('liga tomar somente à construção infinitiva narrada', () => {
    const tomar = curatedInfinitives.find((verb) => verb.pt === 'tomar');
    expect(tomar?.relatedExpressions).toEqual([expect.objectContaining({
      pt: 'tomar banho',
      form: 'infinitive',
      audio: { kind: 'scene-verb', text: 'tomar banho' },
    })]);
  });

  it('liga pegar à construção infinitiva e reaproveita o áudio original', () => {
    const pegar = curatedInfinitives.find((verb) => verb.pt === 'pegar');
    expect(pegar?.relatedExpressions).toEqual([expect.objectContaining({
      pt: 'pegar o ônibus',
      form: 'infinitive',
      audio: { kind: 'scene-verb', text: 'pegar (o ônibus)' },
    })]);
  });

  it('não mistura frases conjugadas ou contextuais às relações do infinitivo', () => {
    const expressions = curatedInfinitives.flatMap((verb) => verb.relatedExpressions);
    expect(expressions).toHaveLength(3);
    expect(expressions.every((expression) => expression.form === 'infinitive')).toBe(true);
    expect(expressions.map((expression) => expression.pt)).toEqual([
      'pegar o ônibus', 'sentir saudade', 'tomar banho',
    ]);
    expect(expressions.some((expression) => expression.pt === 'Sinto muito.')).toBe(false);
    expect(expressions.some((expression) => expression.pt === 'Vou tomar banho rapidinho.')).toBe(false);
  });
});
