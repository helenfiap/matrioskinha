import type { PracticeContext, PedagogicalEntity, TeachingProfile } from '../contracts';

export interface PracticeContextOptions {
  selectedGender?: 'feminine' | 'masculine';
  supportLanguage?: boolean;
}

export function createPracticeContext(
  entity: PedagogicalEntity,
  profile: TeachingProfile,
  options: PracticeContextOptions = {},
): PracticeContext {
  const sceneId = entity.ref.type === 'scene'
    ? entity.ref.id
    : typeof entity.metadata.sceneId === 'string'
      ? entity.metadata.sceneId
      : entity.relationRefs.find((ref) => ref.type === 'scene')?.id;
  const moodId = entity.ref.type === 'emotion'
    ? entity.ref.id
    : typeof entity.metadata.moodId === 'string'
      ? entity.metadata.moodId
      : entity.relationRefs.find((ref) => ref.type === 'emotion')?.id;

  return {
    origin: entity.ref,
    originRoute: entity.route,
    ...(sceneId ? { sceneId } : {}),
    ...(moodId ? { moodId } : {}),
    ...(options.selectedGender ? { selectedGender: options.selectedGender } : {}),
    supportLanguage: options.supportLanguage ?? true,
    availableAssets: {
      audio: profile.modalities.includes('audio'),
      image: profile.modalities.includes('image'),
      scene: profile.modalities.includes('scene'),
    },
  };
}
