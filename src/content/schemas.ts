import { z } from 'zod';

const idSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9:-]*$/);
const bilingualSchema = z.object({ pt: z.string().min(1), ru: z.string().min(1) });
const personFormsSchema = z.object({
  eu: z.string().min(1), tu: z.string().min(1), voce: z.string().min(1),
  nos: z.string().min(1), vos: z.string().min(1), eles: z.string().min(1),
});

export const lexicalItemSchema = z.object({
  id: idSchema,
  lemmaPt: z.string().min(1),
  articlePt: z.enum(['o', 'a', 'os', 'as']).nullable(),
  displayPt: z.string().min(1),
  partOfSpeech: z.literal('noun'),
  gender: z.enum(['masculino', 'feminino']).nullable(),
  pluralPt: z.string().min(1).nullable(),
  status: z.enum(['complete', 'minimal']),
  senses: z.array(z.object({ id: idSchema, translationRu: z.string().min(1) })).min(1),
  exampleIds: z.array(idSchema),
});

export const sceneOccurrenceSchema = z.object({
  id: idSchema,
  legacyId: idSchema,
  sceneId: idSchema,
  lexicalItemId: idSchema,
  senseId: idSchema,
  exampleId: idSchema,
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  category: z.string().min(1),
  function: bilingualSchema.optional(),
  relatedOccurrenceIds: z.array(idSchema),
});

export const phraseSchema = z.object({
  id: idSchema,
  kind: z.enum(['example', 'scene-verb', 'scene-phrase']),
  sceneId: idSchema,
  lexicalItemId: idSchema.optional(),
  verbId: idSchema.nullable().optional(),
  pt: z.string().min(1),
  ru: z.string().min(1),
});

export const cultureNoteSchema = z.object({
  id: idSchema, sceneId: idSchema, pt: z.string().min(1), ru: z.string().min(1),
});

export const sceneSchema = z.object({
  id: idSchema,
  image: z.string().min(1),
  icon: z.string().min(1),
  labels: bilingualSchema,
  cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  difficulty: z.number().int().min(1).max(3),
  occurrenceIds: z.array(idSchema).min(1),
  phraseIds: z.array(idSchema),
  cultureNoteIds: z.array(idSchema),
});

const russianPastFormsSchema = z.object({
  masculine: z.string().min(1), feminine: z.string().min(1),
  neuter: z.string().min(1), plural: z.string().min(1), invariant: z.boolean().optional(),
});

export const verbSchema = z.object({
  id: idSchema, pt: z.string().min(1), ru: z.string().min(1),
  forms: personFormsSchema, ruForms: personFormsSchema,
  note: z.string().min(1).optional(), noteRu: z.string().min(1).optional(),
  pretPerf: personFormsSchema.optional(), pretPeritoRu: russianPastFormsSchema.optional(),
});

export const missionSchema = z.object({
  id: idSchema, sceneId: idSchema, title: bilingualSchema,
  stepOccurrenceIds: z.array(idSchema).min(1),
});

export const vocabularyCardSchema = z.object({
  id: idSchema, lexicalItemId: idSchema, icon: z.string().min(1),
});

export const lessonSchema = z.object({
  id: idSchema, order: z.number().int().positive(), title: bilingualSchema,
  description: bilingualSchema, activityCount: z.number().int().nonnegative(),
  status: z.enum(['available', 'planned']),
});

export const exerciseTemplateSchema = z.object({
  id: idSchema,
  key: z.enum(['choice', 'flash', 'order', 'listen', 'registro']),
  labels: bilingualSchema,
  competency: z.enum(['context', 'visual', 'syntax', 'listening', 'register']),
});

export const contentManifestSchema = z.object({
  schemaVersion: z.literal(1),
  source: z.literal('matrioskinha-app-phase-2'),
  counts: z.object({
    sceneOccurrences: z.number().int().nonnegative(),
    sceneLexicalItems: z.number().int().nonnegative(),
    totalLexicalItems: z.number().int().nonnegative(),
    verbs: z.number().int().nonnegative(),
    scenes: z.number().int().nonnegative(),
    missions: z.number().int().nonnegative(),
  }),
});

export const contentBundleSchema = z.object({
  manifest: contentManifestSchema,
  lexicalItems: z.array(lexicalItemSchema),
  occurrences: z.array(sceneOccurrenceSchema),
  scenes: z.array(sceneSchema),
  phrases: z.array(phraseSchema),
  cultureNotes: z.array(cultureNoteSchema),
  verbs: z.array(verbSchema),
  missions: z.array(missionSchema),
  vocabulary: z.array(vocabularyCardSchema),
  lessons: z.array(lessonSchema),
  exerciseTemplates: z.array(exerciseTemplateSchema),
}).superRefine((bundle, ctx) => {
  const unique = (values: string[], path: string) => {
    const seen = new Set<string>();
    values.forEach((value, index) => {
      if (seen.has(value)) ctx.addIssue({ code: 'custom', message: `ID duplicado: ${value}`, path: [path, index, 'id'] });
      seen.add(value);
    });
  };
  unique(bundle.lexicalItems.map((item) => item.id), 'lexicalItems');
  unique(bundle.occurrences.map((item) => item.id), 'occurrences');
  unique(bundle.scenes.map((item) => item.id), 'scenes');
  unique(bundle.phrases.map((item) => item.id), 'phrases');
  unique(bundle.cultureNotes.map((item) => item.id), 'cultureNotes');
  unique(bundle.verbs.map((item) => item.id), 'verbs');
  unique(bundle.missions.map((item) => item.id), 'missions');
  unique(bundle.vocabulary.map((item) => item.id), 'vocabulary');
  unique(bundle.lessons.map((item) => item.id), 'lessons');
  unique(bundle.exerciseTemplates.map((item) => item.id), 'exerciseTemplates');

  const lexicalById = new Map(bundle.lexicalItems.map((item) => [item.id, item]));
  const occurrenceById = new Map(bundle.occurrences.map((item) => [item.id, item]));
  const sceneById = new Map(bundle.scenes.map((item) => [item.id, item]));
  const phraseIds = new Set(bundle.phrases.map((item) => item.id));
  const cultureIds = new Set(bundle.cultureNotes.map((item) => item.id));
  const verbIds = new Set(bundle.verbs.map((item) => item.id));

  bundle.occurrences.forEach((occurrence, index) => {
    const lexical = lexicalById.get(occurrence.lexicalItemId);
    if (!lexical) {
      ctx.addIssue({ code: 'custom', message: `LexicalItem inexistente: ${occurrence.lexicalItemId}`, path: ['occurrences', index, 'lexicalItemId'] });
      return;
    }
    if (!lexical.senses.some((sense) => sense.id === occurrence.senseId)) {
      ctx.addIssue({ code: 'custom', message: `Sense inexistente: ${occurrence.senseId}`, path: ['occurrences', index, 'senseId'] });
    }
    if (!phraseIds.has(occurrence.exampleId)) {
      ctx.addIssue({ code: 'custom', message: `Exemplo inexistente: ${occurrence.exampleId}`, path: ['occurrences', index, 'exampleId'] });
    }
    occurrence.relatedOccurrenceIds.forEach((relatedId) => {
      const related = occurrenceById.get(relatedId);
      if (!related || related.sceneId !== occurrence.sceneId) {
        ctx.addIssue({ code: 'custom', message: `Relação inválida: ${relatedId}`, path: ['occurrences', index, 'relatedOccurrenceIds'] });
      }
    });
  });

  bundle.scenes.forEach((scene, index) => {
    scene.occurrenceIds.forEach((id) => {
      if (occurrenceById.get(id)?.sceneId !== scene.id) ctx.addIssue({ code: 'custom', message: `Ocorrência inválida: ${id}`, path: ['scenes', index, 'occurrenceIds'] });
    });
    scene.phraseIds.forEach((id) => {
      if (!phraseIds.has(id)) ctx.addIssue({ code: 'custom', message: `Phrase inválida: ${id}`, path: ['scenes', index, 'phraseIds'] });
    });
    scene.cultureNoteIds.forEach((id) => {
      if (!cultureIds.has(id)) ctx.addIssue({ code: 'custom', message: `CultureNote inválida: ${id}`, path: ['scenes', index, 'cultureNoteIds'] });
    });
  });

  bundle.missions.forEach((mission, index) => {
    if (!sceneById.has(mission.sceneId)) ctx.addIssue({ code: 'custom', message: `Cena inexistente: ${mission.sceneId}`, path: ['missions', index, 'sceneId'] });
    mission.stepOccurrenceIds.forEach((id) => {
      if (occurrenceById.get(id)?.sceneId !== mission.sceneId) ctx.addIssue({ code: 'custom', message: `Passo inválido: ${id}`, path: ['missions', index, 'stepOccurrenceIds'] });
    });
  });

  bundle.phrases.forEach((phrase, index) => {
    if (!sceneById.has(phrase.sceneId)) ctx.addIssue({ code: 'custom', message: `Cena inexistente: ${phrase.sceneId}`, path: ['phrases', index, 'sceneId'] });
    if (phrase.lexicalItemId && !lexicalById.has(phrase.lexicalItemId)) ctx.addIssue({ code: 'custom', message: `LexicalItem inexistente: ${phrase.lexicalItemId}`, path: ['phrases', index, 'lexicalItemId'] });
    if (phrase.verbId && !verbIds.has(phrase.verbId)) ctx.addIssue({ code: 'custom', message: `Verb inexistente: ${phrase.verbId}`, path: ['phrases', index, 'verbId'] });
  });

  bundle.lexicalItems.forEach((lexical, index) => {
    lexical.exampleIds.forEach((id) => {
      const phrase = bundle.phrases.find((candidate) => candidate.id === id);
      if (!phrase || phrase.lexicalItemId !== lexical.id || phrase.kind !== 'example') {
        ctx.addIssue({ code: 'custom', message: `Exemplo lexical inválido: ${id}`, path: ['lexicalItems', index, 'exampleIds'] });
      }
    });
  });

  bundle.cultureNotes.forEach((note, index) => {
    if (!sceneById.has(note.sceneId)) ctx.addIssue({ code: 'custom', message: `Cena inexistente: ${note.sceneId}`, path: ['cultureNotes', index, 'sceneId'] });
  });

  bundle.vocabulary.forEach((card, index) => {
    if (!lexicalById.has(card.lexicalItemId)) ctx.addIssue({ code: 'custom', message: `LexicalItem inexistente: ${card.lexicalItemId}`, path: ['vocabulary', index, 'lexicalItemId'] });
  });

  const counts = bundle.manifest.counts;
  const sceneLexicalCount = new Set(bundle.occurrences.map((item) => item.lexicalItemId)).size;
  if (counts.sceneLexicalItems !== sceneLexicalCount) {
    ctx.addIssue({ code: 'custom', message: 'Contagem lexical de cenas divergente', path: ['manifest', 'counts', 'sceneLexicalItems'] });
  }
  if (counts.sceneOccurrences !== bundle.occurrences.length) ctx.addIssue({ code: 'custom', message: 'Contagem de ocorrências divergente', path: ['manifest', 'counts', 'sceneOccurrences'] });
  if (counts.totalLexicalItems !== bundle.lexicalItems.length) ctx.addIssue({ code: 'custom', message: 'Contagem lexical divergente', path: ['manifest', 'counts', 'totalLexicalItems'] });
  if (counts.verbs !== bundle.verbs.length) ctx.addIssue({ code: 'custom', message: 'Contagem verbal divergente', path: ['manifest', 'counts', 'verbs'] });
  if (counts.scenes !== bundle.scenes.length) ctx.addIssue({ code: 'custom', message: 'Contagem de cenas divergente', path: ['manifest', 'counts', 'scenes'] });
  if (counts.missions !== bundle.missions.length) ctx.addIssue({ code: 'custom', message: 'Contagem de missões divergente', path: ['manifest', 'counts', 'missions'] });
});

export const settingsSchema = z.object({
  supportLang: z.boolean(), autoTranslate: z.boolean(), slowAudio: z.boolean(),
  region: z.boolean(), weeklyGoal: z.boolean(), reviewNotification: z.boolean(),
});

export const itemProgressSchema = z.object({
  intervalIndex: z.number().int().min(0).max(6),
  nextReviewDate: z.string().date().nullable(),
  lastReviewedAt: z.string().datetime().optional(),
  lapses: z.number().int().nonnegative().optional(),
});

export const userProgressSchema = z.object({
  schemaVersion: z.literal(2),
  itemProgress: z.record(z.string(), z.record(z.string(), itemProgressSchema)),
  challengeDone: z.object({ choice: z.boolean(), flash: z.boolean(), order: z.boolean(), listen: z.boolean(), registro: z.boolean() }),
  challengeDate: z.string().date(),
  missionsDone: z.record(z.string(), z.boolean()),
  studyDates: z.array(z.string().date()),
  settings: settingsSchema,
});

export const attemptSchema = z.object({
  id: idSchema, userId: idSchema, itemId: idSchema,
  itemType: z.enum(['lexical-item', 'verb', 'lesson', 'emotion']),
  exerciseTemplateId: idSchema.optional(), errorCode: idSchema.optional(),
  modality: z.enum(['visual', 'listening', 'reading', 'writing', 'speaking', 'context']),
  correct: z.boolean(), usedSupportLanguage: z.boolean(),
  answeredAt: z.string().datetime(), durationMs: z.number().int().nonnegative(),
});

export type ContentBundle = z.infer<typeof contentBundleSchema>;
export type LexicalItem = z.infer<typeof lexicalItemSchema>;
export type SceneOccurrence = z.infer<typeof sceneOccurrenceSchema>;
export type CanonicalScene = z.infer<typeof sceneSchema>;
export type Phrase = z.infer<typeof phraseSchema>;
export type CultureNoteEntity = z.infer<typeof cultureNoteSchema>;
export type VerbEntity = z.infer<typeof verbSchema>;
export type MissionEntity = z.infer<typeof missionSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type ExerciseTemplate = z.infer<typeof exerciseTemplateSchema>;
export type UserProgress = z.infer<typeof userProgressSchema>;
export type Attempt = z.infer<typeof attemptSchema>;
