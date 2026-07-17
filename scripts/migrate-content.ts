import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scenes as legacyScenes } from '../src/data/scenarios';
import { missions as legacyMissions } from '../src/data/missions';
import { conjugatorVerbs } from '../src/data/verbs';
import { vocabItems } from '../src/data/vocab';
import { contentBundleSchema, type ContentBundle, type LexicalItem, type Phrase } from '../src/content/schemas';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = resolve(root, 'src/content/data');

function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parseDisplay(displayPt: string) {
  const match = /^(o|a|os|as)\s+(.+)$/i.exec(displayPt.trim());
  return {
    articlePt: (match?.[1]?.toLowerCase() as 'o' | 'a' | 'os' | 'as' | undefined) ?? null,
    lemmaPt: match?.[2] ?? displayPt.trim(),
  };
}

const lexicalByLemma = new Map<string, LexicalItem>();
const sceneLexicalIds = new Set<string>();
const phrases: Phrase[] = [];

function ensureLexical(displayPt: string, translationRu: string, details?: { gender: string; pluralPt: string }) {
  const { articlePt, lemmaPt } = parseDisplay(displayPt);
  const key = lemmaPt.toLocaleLowerCase('pt-BR');
  let lexical = lexicalByLemma.get(key);
  if (!lexical) {
    lexical = {
      id: `lex-${slugify(lemmaPt)}`,
      lemmaPt,
      articlePt,
      displayPt,
      partOfSpeech: 'noun',
      gender: details?.gender === 'masculino' || details?.gender === 'feminino' ? details.gender : null,
      pluralPt: details?.pluralPt ?? null,
      status: details ? 'complete' : 'minimal',
      senses: [],
      exampleIds: [],
    };
    lexicalByLemma.set(key, lexical);
  } else if (details) {
    if (lexical.gender && lexical.gender !== details.gender) throw new Error(`Gênero divergente para ${lemmaPt}`);
    if (lexical.pluralPt && lexical.pluralPt !== details.pluralPt) throw new Error(`Plural divergente para ${lemmaPt}`);
    lexical.gender = details.gender as 'masculino' | 'feminino';
    lexical.pluralPt = details.pluralPt;
    lexical.status = 'complete';
  }
  let sense = lexical.senses.find((item) => item.translationRu === translationRu);
  if (!sense) {
    sense = { id: `${lexical.id}-sense-${lexical.senses.length + 1}`, translationRu };
    lexical.senses.push(sense);
  }
  return { lexical, sense };
}

const verbIdByPt = new Map(conjugatorVerbs.map((verb) => [verb.pt.toLocaleLowerCase('pt-BR'), verb.id]));
const occurrences: ContentBundle['occurrences'] = [];
const scenes: ContentBundle['scenes'] = [];
const cultureNotes: ContentBundle['cultureNotes'] = [];

for (const scene of legacyScenes) {
  const occurrenceIds: string[] = [];
  const phraseIds: string[] = [];
  const cultureNoteIds: string[] = [];

  for (const hotspot of scene.hotspots) {
    const { lexical, sense } = ensureLexical(hotspot.pt, hotspot.ru, { gender: hotspot.gender, pluralPt: hotspot.plural });
    sceneLexicalIds.add(lexical.id);
    const occurrenceId = `${scene.id}:${hotspot.id}`;
    const exampleId = `${occurrenceId}:example`;
    occurrenceIds.push(occurrenceId);
    lexical.exampleIds.push(exampleId);
    phrases.push({ id: exampleId, kind: 'example', sceneId: scene.id, lexicalItemId: lexical.id, pt: hotspot.examplePt, ru: hotspot.exampleRu });
    occurrences.push({
      id: occurrenceId,
      legacyId: hotspot.id,
      sceneId: scene.id,
      lexicalItemId: lexical.id,
      senseId: sense.id,
      exampleId,
      x: hotspot.x,
      y: hotspot.y,
      category: hotspot.cat ?? 'objeto',
      ...(hotspot.func ? { function: hotspot.func } : {}),
      relatedOccurrenceIds: (hotspot.relatedIds ?? []).map((id) => `${scene.id}:${id}`),
    });
  }

  scene.verbs.forEach((verb, index) => {
    const id = `${scene.id}:verb:${index + 1}`;
    phraseIds.push(id);
    phrases.push({ id, kind: 'scene-verb', sceneId: scene.id, verbId: verbIdByPt.get(verb.pt.toLocaleLowerCase('pt-BR')) ?? null, pt: verb.pt, ru: verb.ru });
  });
  scene.phrases.forEach((phrase, index) => {
    const id = `${scene.id}:phrase:${index + 1}`;
    phraseIds.push(id);
    phrases.push({ id, kind: 'scene-phrase', sceneId: scene.id, pt: phrase.pt, ru: phrase.ru });
  });
  scene.culture.forEach((note, index) => {
    const id = `${scene.id}:culture:${index + 1}`;
    cultureNoteIds.push(id);
    cultureNotes.push({ id, sceneId: scene.id, pt: note.pt, ru: note.ru });
  });

  scenes.push({
    id: scene.id,
    image: scene.img,
    icon: scene.icon,
    labels: { pt: scene.labelPt, ru: scene.labelRu },
    cefrLevel: scene.level as ContentBundle['scenes'][number]['cefrLevel'],
    difficulty: scene.difficulty,
    occurrenceIds,
    phraseIds,
    cultureNoteIds,
  });
}

const vocabulary = vocabItems.map((item) => {
  const { lexical } = ensureLexical(item.pt, item.ru);
  return { id: `vocab-${slugify(item.pt)}`, lexicalItemId: lexical.id, icon: item.icon };
});

const missions = legacyMissions.map((mission) => ({
  id: `mission-${mission.sceneId}`,
  sceneId: mission.sceneId,
  title: { pt: mission.titlePt, ru: mission.titleRu },
  stepOccurrenceIds: mission.steps.map((id) => `${mission.sceneId}:${id}`),
}));

const lessonSource = [
  ['Primeiro contato', 'Первый контакт', 'Apresentação, cumprimentos e frases de sobrevivência.', 'Знакомство, приветствия и базовые фразы.', 12],
  ['Ouvir o Brasil', 'Услышать Бразилию', 'Ritmo, nasalização, reduções e sotaques.', 'Ритм, носовые звуки, сокращения и акценты.', 18],
  ['Tu × você', 'Tu × você', 'Uso real, concordância e variação regional.', 'Реальное употребление, согласование и региональные различия.', 14],
  ['Verbos essenciais', 'Основные глаголы', 'Conjugação em contexto e micro-histórias.', 'Спряжение в контексте и микроистории.', 24],
  ['Mundo visual', 'Визуальный мир', 'Casa, comida, cidade, animais e objetos.', 'Дом, еда, город, животные и предметы.', 36],
  ['História da língua', 'История языка', 'Origem, mudança, Brasil e Portugal.', 'Происхождение, изменения, Бразилия и Португалия.', 10],
  ['Português social', 'Социальный португальский', 'Intenção, afeto, ironia e expressões.', 'Намерение, эмоции, ирония и выражения.', 20],
  ['Conversação profunda', 'Глубокая беседа', 'Opinião, ciência, história e cultura.', 'Мнения, наука, история и культура.', 16],
] as const;

const lessons = lessonSource.map(([titlePt, titleRu, descPt, descRu, activityCount], index) => ({
  id: `phase-${index + 1}`,
  order: index + 1,
  title: { pt: titlePt, ru: titleRu },
  description: { pt: descPt, ru: descRu },
  activityCount,
  status: index === 2 ? 'available' as const : 'planned' as const,
}));

const exerciseTemplates: ContentBundle['exerciseTemplates'] = [
  { id: 'exercise-choice', key: 'choice', labels: { pt: 'Escolha contextual', ru: 'Выбор по контексту' }, competency: 'context' },
  { id: 'exercise-flash', key: 'flash', labels: { pt: 'Flashcard visual', ru: 'Визуальная карточка' }, competency: 'visual' },
  { id: 'exercise-order', key: 'order', labels: { pt: 'Ordenar frase', ru: 'Собрать фразу' }, competency: 'syntax' },
  { id: 'exercise-listen', key: 'listen', labels: { pt: 'Compreensão oral', ru: 'Аудирование' }, competency: 'listening' },
  { id: 'exercise-registro', key: 'registro', labels: { pt: 'Classificar registro', ru: 'Определить регистр' }, competency: 'register' },
];

const lexicalItems = [...lexicalByLemma.values()].sort((a, b) => a.id.localeCompare(b.id));
const bundle = contentBundleSchema.parse({
  manifest: {
    schemaVersion: 1,
    source: 'matrioskinha-app-phase-2',
    counts: {
      sceneOccurrences: occurrences.length,
      sceneLexicalItems: sceneLexicalIds.size,
      totalLexicalItems: lexicalItems.length,
      verbs: conjugatorVerbs.length,
      scenes: scenes.length,
      missions: missions.length,
    },
  },
  lexicalItems,
  occurrences,
  scenes,
  phrases,
  cultureNotes,
  verbs: conjugatorVerbs,
  missions,
  vocabulary,
  lessons,
  exerciseTemplates,
});

mkdirSync(outputDir, { recursive: true });
const files: Record<string, unknown> = {
  'manifest.json': bundle.manifest,
  'lexical-items.json': bundle.lexicalItems,
  'scene-occurrences.json': bundle.occurrences,
  'scenes.json': bundle.scenes,
  'phrases.json': bundle.phrases,
  'culture-notes.json': bundle.cultureNotes,
  'verbs.json': bundle.verbs,
  'missions.json': bundle.missions,
  'vocabulary.json': bundle.vocabulary,
  'lessons.json': bundle.lessons,
  'exercise-templates.json': bundle.exerciseTemplates,
};
Object.entries(files).forEach(([filename, data]) => {
  writeFileSync(resolve(outputDir, filename), JSON.stringify(data, null, 2) + '\n', 'utf8');
});
console.log(`Knowledge Core gerado: ${bundle.scenes.length} cenas, ${bundle.occurrences.length} ocorrências, ${sceneLexicalIds.size} itens lexicais de cena, ${bundle.lexicalItems.length} itens totais e ${bundle.verbs.length} verbos.`);
