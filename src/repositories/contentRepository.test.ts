import { describe, expect, it } from 'vitest';
import { contentRepository } from './contentRepository';

describe('ContentRepository', () => {
  it('carrega e expõe o Knowledge Core canônico', () => {
    const bundle = contentRepository.getBundle();
    expect(bundle.manifest.schemaVersion).toBe(1);
    expect(bundle.scenes).toHaveLength(8);
    expect(bundle.occurrences).toHaveLength(90);
    expect(new Set(bundle.occurrences.map((item) => item.lexicalItemId)).size).toBe(78);
    expect(bundle.lexicalItems).toHaveLength(89);
    expect(bundle.verbs).toHaveLength(50);
    expect(contentRepository.listLexicalItems()).toHaveLength(89);
    expect(contentRepository.listCanonicalScenes()).toHaveLength(8);
    expect(contentRepository.listLessons()).toHaveLength(8);
    expect(contentRepository.listExerciseTemplates()).toHaveLength(5);
    expect(contentRepository.listMissions()).toHaveLength(8);
    expect(contentRepository.getOccurrence('sala:sofa')?.legacyId).toBe('sofa');
    expect(contentRepository.getOccurrence('inexistente')).toBeUndefined();
  });

  it('separa o item lexical de suas ocorrências em cenas', () => {
    const towels = contentRepository.listOccurrences().filter((item) => item.lexicalItemId === 'lex-toalha');
    expect(towels.map((item) => item.id)).toEqual(['banheiro:toalha', 'lavanderia:toalha-varal']);
    expect(contentRepository.getLexicalItem('lex-toalha')?.exampleIds).toHaveLength(2);
  });

  it('mantém os contratos legados da interface sem perder conteúdo', () => {
    const scenes = contentRepository.listLegacyScenes();
    expect(scenes.flatMap((scene) => scene.hotspots)).toHaveLength(90);
    expect(scenes.find((scene) => scene.id === 'cozinha')?.hotspots.find((item) => item.id === 'geladeira'))
      .toMatchObject({ pt: 'a geladeira', gender: 'feminino' });
    expect(contentRepository.listLegacyMissions()).toHaveLength(8);
    expect(contentRepository.listLegacyVerbs()).toHaveLength(50);
    expect(contentRepository.listLegacyVocabulary()).toHaveLength(12);
  });
});
