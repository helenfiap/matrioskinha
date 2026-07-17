import { describe, expect, it } from 'vitest';
import type { KnowledgeEntityRef } from '../contracts';
import { pedagogicalEntityRepository as repository } from '../adapters';
import { createPracticeContext } from './practiceContextFactory';
import { teachingProfileResolver as resolver } from './teachingProfileResolver';

function entity(type: KnowledgeEntityRef['type'], id: string) {
  const result = repository.get({ type, id } as KnowledgeEntityRef);
  if (!result) throw new Error(`Entidade ausente: ${type}:${id}`);
  return result;
}

describe('TeachingProfileResolver', () => {
  it('infere conjugação e listening somente quando os dados existem', () => {
    const acalmar = resolver.resolve(entity('verb', 'inf-acalmar-se'));
    const sentir = resolver.resolve(entity('verb', 'inf-sentir'));
    expect(acalmar.capabilities).toEqual(expect.arrayContaining(['conjugation', 'listening', 'association', 'application']));
    expect(sentir.capabilities).toContain('conjugation');
    expect(sentir.capabilities).not.toContain('listening');
  });

  it('não inventa modalidade visual para um mood ainda sem arte', () => {
    const happy = resolver.resolve(entity('emotion', 'feliz'));
    const tired = resolver.resolve(entity('emotion', 'cansada'));
    expect(happy.modalities).toContain('image');
    expect(tired.modalities).not.toContain('image');
    expect(tired.capabilities).toContain('production');
  });

  it('preserva contexto de origem, gênero e disponibilidade de suporte', () => {
    const emotion = entity('emotion', 'feliz');
    const profile = resolver.resolve(emotion);
    expect(createPracticeContext(emotion, profile, { selectedGender: 'feminine' })).toMatchObject({
      origin: { type: 'emotion', id: 'feliz' }, moodId: 'feliz', selectedGender: 'feminine', supportLanguage: true,
      availableAssets: { audio: true, image: true, scene: false },
    });
  });

  it('permite override editorial explícito e auditável', () => {
    const profile = resolver.resolve(entity('verb', 'inf-sentir'), { listening: true, production: false });
    expect(profile.capabilities).toContain('listening');
    expect(profile.editorialOverrides).toEqual({ listening: true, production: false });
  });
});
