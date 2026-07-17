import { learningSkills, type LearningSkill, type TeachingProfile } from '../contracts';
import type { PedagogicalEntity } from '../contracts';

export type TeachingProfileOverrides = Partial<Record<LearningSkill, boolean>>;

const difficultyByType: Record<PedagogicalEntity['ref']['type'], [number, number]> = {
  'lexical-item': [1, 3],
  'scene-occurrence': [1, 3],
  scene: [1, 4],
  phrase: [1, 4],
  verb: [1, 5],
  'verb-expression': [2, 4],
  emotion: [1, 4],
};

export class TeachingProfileResolver {
  resolve(entity: PedagogicalEntity, overrides: TeachingProfileOverrides = {}): TeachingProfile {
    const inferred = new Set<LearningSkill>(['recognition', 'review']);
    const reasons: TeachingProfile['reasons'] = {
      recognition: 'A entidade possui rótulo bilíngue canônico.',
      review: 'Toda entidade catalogada pode retornar ao ciclo de revisão.',
    };
    const hasAudio = entity.assets.some((asset) => asset.type === 'audio' && asset.status === 'validated');
    const hasImage = entity.assets.some((asset) => asset.type === 'image' && asset.status === 'validated');
    const hasSceneAsset = entity.assets.some((asset) => asset.type === 'scene' && asset.status === 'validated');
    const hasSceneRelation = entity.relationRefs.some((ref) => ref.type === 'scene' || ref.type === 'scene-occurrence');
    const isContextual = entity.ref.type === 'scene'
      || entity.ref.type === 'scene-occurrence'
      || Boolean(entity.metadata.hasContext)
      || hasSceneRelation;

    if (isContextual) {
      inferred.add('discovery');
      reasons.discovery = 'A entidade aparece em um cenário ou contexto de uso navegável.';
    }
    if (entity.relationRefs.length > 0) {
      inferred.add('association');
      reasons.association = 'Há relações explícitas com outras entidades do Knowledge Core.';
    }
    if (hasAudio) {
      inferred.add('listening');
      reasons.listening = 'Existe áudio validado no catálogo de assets.';
    }
    if (entity.ref.type === 'phrase' && Number(entity.metadata.tokenCount ?? 0) >= 2) {
      inferred.add('ordering');
      reasons.ordering = 'A unidade contém múltiplos tokens ordenáveis.';
    }
    if (entity.ref.type === 'verb' && entity.metadata.hasFullConjugation === true) {
      inferred.add('conjugation');
      reasons.conjugation = 'O infinitivo possui paradigma completo no conjugador.';
    }
    if (['scene-occurrence', 'verb', 'verb-expression', 'emotion', 'phrase'].includes(entity.ref.type)) {
      inferred.add('application');
      reasons.application = 'A entidade pode ser aplicada em frase, expressão ou situação contextual.';
    }
    if (entity.relationRefs.length >= 2 || (Array.isArray(entity.metadata.sources) && entity.metadata.sources.length >= 2)) {
      inferred.add('transfer');
      reasons.transfer = 'A entidade conecta mais de uma ocorrência, fonte ou contexto de uso.';
    }
    if (entity.metadata.hasProductionPrompt === true || Boolean(entity.metadata.productionPromptPt)) {
      inferred.add('production');
      reasons.production = 'Existe uma proposta editorial de produção guiada.';
    }

    Object.entries(overrides).forEach(([skill, enabled]) => {
      if (enabled) inferred.add(skill as LearningSkill);
      else inferred.delete(skill as LearningSkill);
    });

    const modalities: TeachingProfile['modalities'] = ['text'];
    if (hasAudio) modalities.push('audio');
    if (hasImage) modalities.push('image');
    if (hasSceneAsset || hasSceneRelation || entity.ref.type === 'scene-occurrence') modalities.push('scene');

    const baseRange = difficultyByType[entity.ref.type];
    const sceneDifficulty = entity.ref.type === 'scene' ? Number(entity.metadata.difficulty ?? 1) : null;
    const difficultyRange: [number, number] = sceneDifficulty
      ? [Math.max(1, sceneDifficulty), Math.min(5, sceneDifficulty + 2)]
      : [...baseRange];

    return {
      entityRef: entity.ref,
      capabilities: learningSkills.filter((skill) => inferred.has(skill)),
      modalities,
      difficultyRange,
      relationRefs: entity.relationRefs,
      reasons,
      ...(Object.keys(overrides).length > 0 ? { editorialOverrides: overrides } : {}),
    };
  }
}

export const teachingProfileResolver = new TeachingProfileResolver();
