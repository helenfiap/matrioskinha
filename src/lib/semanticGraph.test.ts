import { describe, expect, it } from 'vitest';
import { countSameWordEdges, getRelatedOccurrences } from './semanticGraph';

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
});
