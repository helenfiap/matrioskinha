import { contentRepository } from '../repositories/contentRepository';

// Compatibility adapter. New features should consume the canonical repository.
export const scenes = contentRepository.listLegacyScenes();
