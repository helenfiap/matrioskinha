import { describe, expect, it } from 'vitest';
import { contentBundleSchema, type ContentBundle } from './schemas';
import { contentRepository } from '../repositories/contentRepository';

describe('contentBundleSchema', () => {
  it('aceita o bundle publicado', () => {
    expect(contentBundleSchema.safeParse(contentRepository.getBundle()).success).toBe(true);
  });

  it('rejeita referências quebradas', () => {
    const source = contentRepository.getBundle();
    const broken = structuredClone(source);
    broken.occurrences[0].lexicalItemId = 'lex-inexistente';
    const result = contentBundleSchema.safeParse(broken);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.path.includes('lexicalItemId'))).toBe(true);
  });

  it('rejeita contagem de migração divergente', () => {
    const broken = structuredClone(contentRepository.getBundle());
    broken.manifest.counts.sceneLexicalItems = 77;
    expect(contentBundleSchema.safeParse(broken).success).toBe(false);
  });

  it('rejeita referências inválidas em todas as fronteiras entre entidades', () => {
    const source = contentRepository.getBundle();
    const mutations: Array<(bundle: ContentBundle) => void> = [
      (bundle) => { bundle.occurrences[0].senseId = 'sense-inexistente'; },
      (bundle) => { bundle.occurrences[0].exampleId = 'example-inexistente'; },
      (bundle) => { bundle.occurrences[0].relatedOccurrenceIds = ['cozinha:geladeira']; },
      (bundle) => { bundle.scenes[0].occurrenceIds[0] = 'cozinha:geladeira'; },
      (bundle) => { bundle.scenes[0].phraseIds[0] = 'phrase-inexistente'; },
      (bundle) => { bundle.scenes[0].cultureNoteIds[0] = 'culture-inexistente'; },
      (bundle) => { bundle.missions[0].sceneId = 'scene-inexistente'; },
      (bundle) => { bundle.missions[0].stepOccurrenceIds[0] = 'cozinha:geladeira'; },
      (bundle) => { bundle.phrases[0].sceneId = 'scene-inexistente'; },
      (bundle) => { bundle.phrases[0].lexicalItemId = 'lex-inexistente'; },
      (bundle) => { bundle.cultureNotes[0].sceneId = 'scene-inexistente'; },
      (bundle) => { bundle.vocabulary[0].lexicalItemId = 'lex-inexistente'; },
      (bundle) => { bundle.lexicalItems[0].exampleIds[0] = 'example-inexistente'; },
    ];

    for (const mutate of mutations) {
      const broken: ContentBundle = structuredClone(source);
      mutate(broken);
      expect(contentBundleSchema.safeParse(broken).success).toBe(false);
    }
  });
});
