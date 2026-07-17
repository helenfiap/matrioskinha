import type { ConjPerson, ConjugatorVerb } from '../types';
import { contentRepository } from '../repositories/contentRepository';
import { emotionMoods } from './emotions';
import { emotionVocabularyContent } from './emotionVocabulary';

export const conjPersons: ConjPerson[] = [
  { key: 'eu', pt: 'eu', ru: 'я' },
  { key: 'tu', pt: 'tu', ru: 'ты' },
  { key: 'voce', pt: 'você / ele / ela', ru: 'он / она (Вы)' },
  { key: 'nos', pt: 'nós', ru: 'мы' },
  { key: 'vos', pt: 'vós*', ru: 'вы (мн.)' },
  { key: 'eles', pt: 'eles / elas / vocês', ru: 'они' },
];

export type InfinitiveGroup = 'ar' | 'er' | 'ir' | 'reflexive' | 'locution' | 'other';
export type VerbSource = 'core' | 'scene' | 'emotion';

export interface VerbContext {
  kind: 'scene' | 'emotion';
  id: string;
  pt: string;
  ru: string;
}

export interface CuratedInfinitive extends ConjugatorVerb {
  group: InfinitiveGroup;
  hasFullConjugation: boolean;
  sources: VerbSource[];
  contexts: VerbContext[];
}

const emptyForms: ConjugatorVerb['forms'] = {
  eu: '', tu: '', voce: '', nos: '', vos: '', eles: '',
};

function normalizeInfinitive(text: string): string {
  return text.toLocaleLowerCase('pt-BR').replace(/\s*\([^)]*\)\s*/g, ' ').trim().replace(/\s+/g, ' ');
}

function safeInfinitiveId(text: string): string {
  return normalizeInfinitive(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function infinitiveGroup(text: string): InfinitiveGroup {
  const normalized = normalizeInfinitive(text);
  if (normalized.includes(' ')) return 'locution';
  if (normalized.endsWith('-se')) return 'reflexive';
  if (normalized.endsWith('ar')) return 'ar';
  if (normalized.endsWith('er') || normalized.endsWith('ôr')) return 'er';
  if (normalized.endsWith('ir')) return 'ir';
  return 'other';
}

const curatedByInfinitive = new Map<string, CuratedInfinitive>();

function addInfinitive(input: {
  pt: string;
  ru: string;
  source: VerbSource;
  verb?: ConjugatorVerb;
  context?: VerbContext;
}) {
  const pt = normalizeInfinitive(input.pt);
  const existing = curatedByInfinitive.get(pt);
  if (existing) {
    if (!existing.sources.includes(input.source)) existing.sources.push(input.source);
    if (input.context && !existing.contexts.some((context) => context.kind === input.context?.kind && context.id === input.context.id)) {
      existing.contexts.push(input.context);
    }
    return;
  }

  curatedByInfinitive.set(pt, {
    id: input.verb?.id ?? `inf-${safeInfinitiveId(pt)}`,
    pt,
    ru: input.verb?.ru ?? input.ru,
    forms: input.verb?.forms ?? { ...emptyForms },
    ruForms: input.verb?.ruForms ?? { ...emptyForms },
    note: input.verb?.note,
    noteRu: input.verb?.noteRu,
    pretPerf: input.verb?.pretPerf,
    pretPeritoRu: input.verb?.pretPeritoRu,
    group: infinitiveGroup(pt),
    hasFullConjugation: Boolean(input.verb),
    sources: [input.source],
    contexts: input.context ? [input.context] : [],
  });
}

// Compatibility adapter: VerbEntity remains the canonical source for full tables.
export const conjugatorVerbs = contentRepository.listLegacyVerbs();
for (const verb of conjugatorVerbs) addInfinitive({ pt: verb.pt, ru: verb.ru, source: 'core', verb });

for (const scene of contentRepository.listLegacyScenes()) {
  for (const verb of scene.verbs) {
    addInfinitive({
      pt: verb.pt,
      ru: verb.ru,
      source: 'scene',
      context: { kind: 'scene', id: scene.id, pt: scene.labelPt, ru: scene.labelRu },
    });
  }
}

const moodById = new Map(emotionMoods.map((mood) => [mood.id, mood]));
for (const vocabulary of emotionVocabularyContent) {
  const mood = moodById.get(vocabulary.moodId);
  if (!mood) continue;
  for (const verb of vocabulary.verbs) {
    addInfinitive({
      pt: verb.pt,
      ru: verb.ru,
      source: 'emotion',
      context: {
        kind: 'emotion',
        id: mood.id,
        pt: `${mood.pt.feminine} / ${mood.pt.masculine}`,
        ru: `${mood.ru.feminine} / ${mood.ru.masculine}`,
      },
    });
  }
}

export const curatedInfinitives = [...curatedByInfinitive.values()].sort((left, right) =>
  left.pt.localeCompare(right.pt, 'pt-BR'),
);
