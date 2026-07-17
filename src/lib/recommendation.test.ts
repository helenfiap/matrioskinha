import { describe, expect, it } from 'vitest';
import { scenes } from '../data/scenarios';
import { getNextBestAction } from './recommendation';

function countsFor(overrides: Record<string, Partial<{ reviewed: number; mastered: number; total: number }>> = {}) {
  return Object.fromEntries(
    scenes.map((scene) => [
      scene.id,
      {
        reviewed: overrides[scene.id]?.reviewed ?? 0,
        mastered: overrides[scene.id]?.mastered ?? 0,
        total: overrides[scene.id]?.total ?? scene.hotspots.length,
      },
    ])
  );
}

describe('getNextBestAction', () => {
  it('prioriza revisoes vencidas acima de qualquer outra atividade', () => {
    const result = getNextBestAction({
      pendingReviewCount: 2,
      sceneCounts: countsFor({ sala: { reviewed: 8, mastered: 0 } }),
    });

    expect(result.type).toBe('revisar');
    expect(result.count).toBe(2);
    expect(result.to).toBe('/progresso?section=revisao');
  });

  it('recomenda pratica quando uma cena ja foi suficientemente explorada', () => {
    const result = getNextBestAction({
      pendingReviewCount: 0,
      sceneCounts: countsFor({ sala: { reviewed: 4, mastered: 1 } }),
    });

    expect(result.type).toBe('praticar');
    expect(result.sceneId).toBe('sala');
    expect(result.to).toBe('/cenarios?scene=sala');
  });

  it('escolhe a cena incompleta de menor nivel quando nao ha revisao ou pratica', () => {
    const result = getNextBestAction({ pendingReviewCount: 0, sceneCounts: countsFor() });

    expect(result.type).toBe('explorar');
    expect(result.sceneId).toBe('sala');
  });

  it('direciona para a trilha quando todo o conteudo esta dominado', () => {
    const complete = Object.fromEntries(
      scenes.map((scene) => [scene.id, {
        reviewed: scene.hotspots.length,
        mastered: scene.hotspots.length,
        total: scene.hotspots.length,
      }])
    );

    const result = getNextBestAction({ pendingReviewCount: 0, sceneCounts: complete });

    expect(result.type).toBe('continuar');
    expect(result.to).toBe('/trilha');
  });
});
