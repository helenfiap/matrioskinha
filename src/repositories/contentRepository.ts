import type { ConjugatorVerb, Hotspot, Scene, VocabItem } from '../types';
import {
  contentBundleSchema,
  type CanonicalScene,
  type ContentBundle,
  type ExerciseTemplate,
  type Lesson,
  type LexicalItem,
  type MissionEntity,
  type SceneOccurrence,
} from '../content/schemas';
import manifest from '../content/data/manifest.json';
import lexicalItems from '../content/data/lexical-items.json';
import occurrences from '../content/data/scene-occurrences.json';
import scenes from '../content/data/scenes.json';
import phrases from '../content/data/phrases.json';
import cultureNotes from '../content/data/culture-notes.json';
import verbs from '../content/data/verbs.json';
import missions from '../content/data/missions.json';
import vocabulary from '../content/data/vocabulary.json';
import lessons from '../content/data/lessons.json';
import exerciseTemplates from '../content/data/exercise-templates.json';

const bundle = contentBundleSchema.parse({
  manifest,
  lexicalItems,
  occurrences,
  scenes,
  phrases,
  cultureNotes,
  verbs,
  missions,
  vocabulary,
  lessons,
  exerciseTemplates,
});

const lexicalById = new Map(bundle.lexicalItems.map((item) => [item.id, item]));
const occurrenceById = new Map(bundle.occurrences.map((item) => [item.id, item]));
const phraseById = new Map(bundle.phrases.map((item) => [item.id, item]));
const cultureById = new Map(bundle.cultureNotes.map((item) => [item.id, item]));

function required<T>(value: T | undefined, description: string): T {
  if (!value) throw new Error(`Knowledge Core inconsistente: ${description}`);
  return value;
}

function legacyHotspot(occurrence: SceneOccurrence): Hotspot {
  const lexical = required(lexicalById.get(occurrence.lexicalItemId), occurrence.lexicalItemId);
  const sense = required(
    lexical.senses.find((candidate) => candidate.id === occurrence.senseId),
    occurrence.senseId,
  );
  const example = required(phraseById.get(occurrence.exampleId), occurrence.exampleId);
  return {
    id: occurrence.legacyId,
    lexicalItemId: occurrence.lexicalItemId,
    exampleId: occurrence.exampleId,
    x: occurrence.x,
    y: occurrence.y,
    cat: occurrence.category,
    func: occurrence.function,
    relatedIds: occurrence.relatedOccurrenceIds.map((id) => required(occurrenceById.get(id), id).legacyId),
    pt: lexical.displayPt,
    ru: sense.translationRu,
    gender: lexical.gender ?? '',
    plural: lexical.pluralPt ?? '',
    examplePt: example.pt,
    exampleRu: example.ru,
  };
}

function legacyScene(scene: CanonicalScene): Scene {
  const scenePhrases = scene.phraseIds.map((id) => required(phraseById.get(id), id));
  return {
    id: scene.id,
    img: scene.image,
    labelPt: scene.labels.pt,
    labelRu: scene.labels.ru,
    icon: scene.icon,
    level: scene.cefrLevel,
    difficulty: scene.difficulty,
    hotspots: scene.occurrenceIds.map((id) => legacyHotspot(required(occurrenceById.get(id), id))),
    verbs: scenePhrases.filter((item) => item.kind === 'scene-verb').map(({ id, pt, ru }) => ({ id, pt, ru })),
    phrases: scenePhrases.filter((item) => item.kind === 'scene-phrase').map(({ id, pt, ru }) => ({ id, pt, ru })),
    culture: scene.cultureNoteIds.map((id) => {
      const note = required(cultureById.get(id), id);
      return { pt: note.pt, ru: note.ru };
    }),
  };
}

export interface LegacyMission {
  sceneId: string;
  titlePt: string;
  titleRu: string;
  steps: string[];
}

export class ContentRepository {
  getBundle(): Readonly<ContentBundle> { return bundle; }
  listLexicalItems(): readonly LexicalItem[] { return bundle.lexicalItems; }
  listOccurrences(): readonly SceneOccurrence[] { return bundle.occurrences; }
  listCanonicalScenes(): readonly CanonicalScene[] { return bundle.scenes; }
  listLessons(): readonly Lesson[] { return bundle.lessons; }
  listExerciseTemplates(): readonly ExerciseTemplate[] { return bundle.exerciseTemplates; }
  listMissions(): readonly MissionEntity[] { return bundle.missions; }
  getLexicalItem(id: string): LexicalItem | undefined { return lexicalById.get(id); }
  getOccurrence(id: string): SceneOccurrence | undefined { return occurrenceById.get(id); }
  listLegacyScenes(): Scene[] { return bundle.scenes.map(legacyScene); }
  listLegacyVerbs(): ConjugatorVerb[] { return bundle.verbs.map((verb) => ({ ...verb })); }
  listLegacyVocabulary(): VocabItem[] {
    return bundle.vocabulary.map((card) => {
      const lexical = required(lexicalById.get(card.lexicalItemId), card.lexicalItemId);
      return { lexicalItemId: lexical.id, icon: card.icon, pt: lexical.displayPt, ru: lexical.senses[0].translationRu };
    });
  }
  listLegacyMissions(): LegacyMission[] {
    return bundle.missions.map((mission) => ({
      sceneId: mission.sceneId,
      titlePt: mission.title.pt,
      titleRu: mission.title.ru,
      steps: mission.stepOccurrenceIds.map((id) => required(occurrenceById.get(id), id).legacyId),
    }));
  }
}

export const contentRepository = new ContentRepository();
