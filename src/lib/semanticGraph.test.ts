import { describe, expect, it } from 'vitest';
import {
  countSameWordEdges,
  getLexicalKnowledgeOccurrences,
  getLexicalKnowledgeNode,
  getRelatedOccurrences,
  getVerbKnowledgeNode,
} from './semanticGraph';

describe('semanticGraph', () => {
  it('conecta ocorrencias da mesma palavra em cenas diferentes', () => {
    const related = getRelatedOccurrences('banheiro', 'toalha');

    expect(related).toEqual(expect.arrayContaining([
      expect.objectContaining({
        sceneId: 'lavanderia',
        hotspotId: 'toalha-varal',
        relation: 'mesma_palavra',
      }),
    ]));
  });

  it('preserva relacoes editoriais dentro da mesma cena sem duplicar o item atual', () => {
    const related = getRelatedOccurrences('banheiro', 'toalha');

    expect(related).toEqual(expect.arrayContaining([
      expect.objectContaining({
        sceneId: 'banheiro',
        hotspotId: 'chuveiro',
        relation: 'relacionado',
      }),
    ]));
    expect(related).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ sceneId: 'banheiro', hotspotId: 'toalha' }),
    ]));
  });

  it('mantem o inventario conhecido de ocorrencias conectadas automaticamente', () => {
    expect(countSameWordEdges()).toBe(21);
  });

  it('retorna vazio para referencias inexistentes', () => {
    expect(getRelatedOccurrences('inexistente', 'nada')).toEqual([]);
  });

  it('resolve verbos e construcoes para o mesmo lema canonico', () => {
    expect(getVerbKnowledgeNode('acalmar-se')).toMatchObject({ lemma: 'acalmar-se', conjugatorHref: '/conjugador?q=acalmar-se' });
    expect(getVerbKnowledgeNode('pegar (o ônibus)')).toMatchObject({ lemma: 'pegar' });
    expect(getVerbKnowledgeNode('pegar o ônibus')).toMatchObject({ lemma: 'pegar' });
    expect(getVerbKnowledgeNode('sentir saudade')).toMatchObject({ lemma: 'sentir' });
  });

  it('leva um verbo aos contextos de cenario e emocao', () => {
    const relaxar = getVerbKnowledgeNode('relaxar');
    expect(relaxar?.contexts).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'scene', id: 'sala', href: '/cenarios?scene=sala' }),
      expect.objectContaining({ kind: 'emotion', id: 'calma', href: '/cenarios?collection=emotions&mood=calma' }),
    ]));
  });

  it('conecta lexico geral às ocorrencias equivalentes nos cenarios', () => {
    expect(getLexicalKnowledgeOccurrences('o ônibus')).toEqual(expect.arrayContaining([
      expect.objectContaining({ sceneId: 'transporte', href: expect.stringContaining('scene=transporte') }),
    ]));
    expect(getLexicalKnowledgeNode('ônibus')).toMatchObject({
      pt: 'o ônibus',
      vocabularyHref: expect.stringContaining('/vocab?item='),
    });
  });
});
