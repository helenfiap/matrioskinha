import { contentRepository } from '../repositories/contentRepository';

// Compatibility adapter. Canonical vocabulary references LexicalItem IDs.
export const vocabItems = contentRepository.listLegacyVocabulary();
