import type { ConjPerson } from '../types';
import { contentRepository } from '../repositories/contentRepository';

export const conjPersons: ConjPerson[] = [
  { key: 'eu', pt: 'eu', ru: 'я' },
  { key: 'tu', pt: 'tu', ru: 'ты' },
  { key: 'voce', pt: 'você / ele / ela', ru: 'он / она (Вы)' },
  { key: 'nos', pt: 'nós', ru: 'мы' },
  { key: 'vos', pt: 'vós*', ru: 'вы (мн.)' },
  { key: 'eles', pt: 'eles / elas / vocês', ru: 'они' },
];

// Compatibility adapter. VerbEntity is the canonical source.
export const conjugatorVerbs = contentRepository.listLegacyVerbs();
