import type { ConjPerson, ConjugatorVerb } from '../types';
import { contentRepository } from '../repositories/contentRepository';
import { emotionMoods } from './emotions';
import { emotionVocabularyContent } from './emotionVocabulary';
import { expandedConjugatorVerbs } from './expandedVerbConjugations';

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

export type RelatedExpressionAudio =
  | { kind: 'emotion'; text: string; voiceRole: 'female' | 'male' }
  | { kind: 'scene-verb'; text: string };

export interface RelatedVerbExpression {
  id: string;
  pt: string;
  ru: string;
  form: 'infinitive';
  audio: RelatedExpressionAudio;
}

export interface CuratedInfinitive extends ConjugatorVerb {
  group: InfinitiveGroup;
  hasFullConjugation: boolean;
  sources: VerbSource[];
  contexts: VerbContext[];
  infinitiveAudio?: RelatedExpressionAudio;
  relatedExpressions: RelatedVerbExpression[];
}

const emptyForms: ConjugatorVerb['forms'] = {
  eu: '', tu: '', voce: '', nos: '', vos: '', eles: '',
};

function normalizeInfinitive(text: string): string {
  return text.toLocaleLowerCase('pt-BR').replace(/\s*\([^)]*\)\s*/g, ' ').trim().replace(/\s+/g, ' ');
}

const locutionLemmas: Record<string, { pt: string; ru: string }> = {
  'sentir saudade': { pt: 'sentir', ru: 'чувствовать' },
  'tomar banho': { pt: 'tomar', ru: 'брать / принимать' },
};

function sourceVerbModel(text: string, ru: string): {
  lemmaPt: string;
  lemmaRu: string;
  expression?: { pt: string; ru: string };
} {
  const source = text.toLocaleLowerCase('pt-BR').trim().replace(/\s+/g, ' ');
  const locutionLemma = locutionLemmas[source];
  if (locutionLemma) return { lemmaPt: locutionLemma.pt, lemmaRu: locutionLemma.ru, expression: { pt: source, ru } };
  if (/\([^)]*\)/.test(source)) {
    return {
      lemmaPt: normalizeInfinitive(source),
      lemmaRu: ru,
      expression: { pt: source.replace(/\s*\(([^)]*)\)/g, ' $1').replace(/\s+/g, ' ').trim(), ru },
    };
  }
  return { lemmaPt: normalizeInfinitive(source), lemmaRu: ru };
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
  audio?: RelatedExpressionAudio;
}): CuratedInfinitive {
  const pt = normalizeInfinitive(input.pt);
  const existing = curatedByInfinitive.get(pt);
  if (existing) {
    if (!existing.sources.includes(input.source)) existing.sources.push(input.source);
    if (input.context && !existing.contexts.some((context) => context.kind === input.context?.kind && context.id === input.context.id)) {
      existing.contexts.push(input.context);
    }
    if (input.audio && !existing.infinitiveAudio) existing.infinitiveAudio = input.audio;
    return existing;
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
    infinitiveAudio: input.audio,
    relatedExpressions: [],
  });
  return curatedByInfinitive.get(pt)!;
}

function addRelatedExpression(verb: CuratedInfinitive, expression: RelatedVerbExpression) {
  const key = expression.pt.toLocaleLowerCase('pt-BR').trim().replace(/\s+/g, ' ');
  if (!verb.relatedExpressions.some((candidate) => candidate.pt.toLocaleLowerCase('pt-BR') === key)) {
    verb.relatedExpressions.push(expression);
  }
}

// Compatibility adapter: VerbEntity remains the canonical source for full tables.
const knowledgeCoreVerbs = contentRepository.listLegacyVerbs();
for (const verb of knowledgeCoreVerbs) addInfinitive({ pt: verb.pt, ru: verb.ru, source: 'core', verb });

for (const scene of contentRepository.listLegacyScenes()) {
  for (const verb of scene.verbs) {
    const model = sourceVerbModel(verb.pt, verb.ru);
    const curated = addInfinitive({
      pt: model.lemmaPt,
      ru: model.lemmaRu,
      source: 'scene',
      context: { kind: 'scene', id: scene.id, pt: scene.labelPt, ru: scene.labelRu },
      audio: model.expression ? undefined : { kind: 'scene-verb', text: verb.pt },
    });
    if (model.expression) addRelatedExpression(curated, {
      id: `scene:${scene.id}:collocation:${safeInfinitiveId(model.expression.pt)}`,
      ...model.expression,
      form: 'infinitive',
      audio: { kind: 'scene-verb', text: verb.pt },
    });
  }
}

const moodById = new Map(emotionMoods.map((mood) => [mood.id, mood]));
for (const vocabulary of emotionVocabularyContent) {
  const mood = moodById.get(vocabulary.moodId);
  if (!mood) continue;
  for (const verb of vocabulary.verbs) {
    const model = sourceVerbModel(verb.pt, verb.ru);
    const curated = addInfinitive({
      pt: model.lemmaPt,
      ru: model.lemmaRu,
      source: 'emotion',
      context: {
        kind: 'emotion',
        id: mood.id,
        pt: `${mood.pt.feminine} / ${mood.pt.masculine}`,
        ru: `${mood.ru.feminine} / ${mood.ru.masculine}`,
      },
      audio: model.expression ? undefined : { kind: 'emotion', text: verb.pt, voiceRole: 'female' },
    });
    if (model.expression) addRelatedExpression(curated, {
      id: `emotion:${mood.id}:collocation:${safeInfinitiveId(model.expression.pt)}`,
      ...model.expression,
      form: 'infinitive',
      audio: { kind: 'emotion', text: verb.pt, voiceRole: 'female' },
    });
  }
}

for (const verb of expandedConjugatorVerbs) {
  const curated = curatedByInfinitive.get(normalizeInfinitive(verb.pt));
  if (!curated) throw new Error(`Expanded conjugation has no lexical source: ${verb.pt}`);
  Object.assign(curated, {
    forms: verb.forms,
    ruForms: verb.ruForms,
    note: verb.note,
    noteRu: verb.noteRu,
    pretPerf: verb.pretPerf,
    pretPeritoRu: verb.pretPeritoRu,
    hasFullConjugation: true,
  });
}

export const conjugatorVerbs = [...knowledgeCoreVerbs, ...expandedConjugatorVerbs];

export const curatedInfinitives = [...curatedByInfinitive.values()].sort((left, right) =>
  left.pt.localeCompare(right.pt, 'pt-BR'),
);
