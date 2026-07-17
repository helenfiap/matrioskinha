import { contentRepository } from '../../repositories/contentRepository';
import { emotionCharacters, emotionMoods } from '../../data/emotions';
import { emotionLearningByMoodId } from '../../data/emotionLearning';
import { emotionVocabularyContent } from '../../data/emotionVocabulary';
import { curatedInfinitives, type RelatedExpressionAudio } from '../../data/verbs';
import { audioAssets } from '../../lib/audioAssets';
import { pedagogicalAssetRegistry } from '../assets';
import {
  entityRefKey,
  type KnowledgeEntityRef,
  type PedagogicalAsset,
  type PedagogicalEntity,
} from '../contracts';

function uniqueRefs(refs: KnowledgeEntityRef[]): KnowledgeEntityRef[] {
  return [...new Map(refs.map((ref) => [entityRefKey(ref), ref])).values()];
}

function audioFromDescriptor(audio: RelatedExpressionAudio, role: string): PedagogicalAsset | null {
  const src = audio.kind === 'emotion'
    ? audioAssets.emotion(audio.text, audio.voiceRole)
    : audioAssets.sceneVerb(audio.text);
  return pedagogicalAssetRegistry.audio(src, role);
}

function first<T>(value: T | undefined, description: string): T {
  if (!value) throw new Error(`Entidade pedagógica inconsistente: ${description}`);
  return value;
}

function normalize(value: string): string {
  return value.toLocaleLowerCase('pt-BR').trim().replace(/\s+/g, ' ');
}

export class PedagogicalEntityRepository {
  private readonly entities = new Map<string, PedagogicalEntity>();

  constructor() {
    this.build();
  }

  list(type?: KnowledgeEntityRef['type']): readonly PedagogicalEntity[] {
    const values = [...this.entities.values()];
    return type ? values.filter((entity) => entity.ref.type === type) : values;
  }

  get(ref: KnowledgeEntityRef): PedagogicalEntity | undefined {
    return this.entities.get(entityRefKey(ref));
  }

  has(ref: KnowledgeEntityRef): boolean {
    return this.entities.has(entityRefKey(ref));
  }

  unresolvedRelations(): Array<{ source: KnowledgeEntityRef; target: KnowledgeEntityRef }> {
    return this.list().flatMap((entity) => entity.relationRefs
      .filter((target) => !this.has(target))
      .map((target) => ({ source: entity.ref, target })));
  }

  private add(entity: PedagogicalEntity): void {
    const key = entityRefKey(entity.ref);
    if (this.entities.has(key)) throw new Error(`Entidade pedagógica duplicada: ${key}`);
    this.entities.set(key, { ...entity, relationRefs: uniqueRefs(entity.relationRefs) });
  }

  private build(): void {
    const bundle = contentRepository.getBundle();
    const vocabularyIds = new Set(bundle.vocabulary.map((card) => card.lexicalItemId));
    const curatedByPt = new Map(curatedInfinitives.map((verb) => [normalize(verb.pt), verb]));
    const canonicalVerbById = new Map(bundle.verbs.map((verb) => [verb.id, verb]));

    bundle.scenes.forEach((scene) => this.add({
      ref: { type: 'scene', id: scene.id },
      label: scene.labels,
      route: `/cenarios?scene=${encodeURIComponent(scene.id)}`,
      assets: [pedagogicalAssetRegistry.sceneImage(scene.id, scene.image)],
      relationRefs: [
        ...scene.occurrenceIds.map((id): KnowledgeEntityRef => ({ type: 'scene-occurrence', id })),
        ...scene.phraseIds.map((id): KnowledgeEntityRef => ({ type: 'phrase', id })),
      ],
      metadata: { difficulty: scene.difficulty, cefrLevel: scene.cefrLevel, hasContext: true },
    }));

    bundle.lexicalItems.forEach((lexical) => {
      const occurrences = bundle.occurrences.filter((item) => item.lexicalItemId === lexical.id);
      const firstOccurrence = occurrences[0];
      this.add({
        ref: { type: 'lexical-item', id: lexical.id },
        label: { pt: lexical.displayPt, ru: lexical.senses[0].translationRu },
        route: vocabularyIds.has(lexical.id)
          ? `/vocab?item=${encodeURIComponent(lexical.id)}`
          : firstOccurrence
            ? `/cenarios?scene=${encodeURIComponent(firstOccurrence.sceneId)}&hotspot=${encodeURIComponent(firstOccurrence.legacyId)}`
            : '/vocab',
        assets: [pedagogicalAssetRegistry.audio(audioAssets.word(lexical.id), 'lemma')].filter(Boolean) as PedagogicalAsset[],
        relationRefs: occurrences.map((item) => ({ type: 'scene-occurrence', id: item.id })),
        metadata: {
          status: lexical.status,
          partOfSpeech: lexical.partOfSpeech,
          occurrenceCount: occurrences.length,
          hasVocabularyCard: vocabularyIds.has(lexical.id),
        },
      });
    });

    bundle.occurrences.forEach((occurrence) => {
      const lexical = first(contentRepository.getLexicalItem(occurrence.lexicalItemId), occurrence.lexicalItemId);
      const sense = first(lexical.senses.find((item) => item.id === occurrence.senseId), occurrence.senseId);
      const example = first(bundle.phrases.find((item) => item.id === occurrence.exampleId), occurrence.exampleId);
      const scene = first(bundle.scenes.find((item) => item.id === occurrence.sceneId), occurrence.sceneId);
      this.add({
        ref: { type: 'scene-occurrence', id: occurrence.id },
        label: { pt: lexical.displayPt, ru: sense.translationRu },
        route: `/cenarios?scene=${encodeURIComponent(occurrence.sceneId)}&hotspot=${encodeURIComponent(occurrence.legacyId)}`,
        assets: [
          pedagogicalAssetRegistry.audio(audioAssets.word(lexical.id), 'lemma'),
          pedagogicalAssetRegistry.audio(audioAssets.example(example.id), 'example'),
          pedagogicalAssetRegistry.sceneImage(scene.id, scene.image),
        ].filter(Boolean) as PedagogicalAsset[],
        relationRefs: [
          { type: 'lexical-item', id: lexical.id },
          { type: 'scene', id: occurrence.sceneId },
          { type: 'phrase', id: example.id },
          ...occurrence.relatedOccurrenceIds.map((id): KnowledgeEntityRef => ({ type: 'scene-occurrence', id })),
        ],
        metadata: { sceneId: occurrence.sceneId, category: occurrence.category, hasContext: true },
      });
    });

    bundle.phrases.forEach((phrase) => {
      const src = phrase.kind === 'example'
        ? audioAssets.example(phrase.id)
        : phrase.kind === 'scene-verb'
          ? audioAssets.sceneVerb(phrase.pt)
          : audioAssets.scenePhrase(phrase.id);
      const verb = phrase.verbId ? canonicalVerbById.get(phrase.verbId) : curatedByPt.get(normalize(phrase.pt));
      this.add({
        ref: { type: 'phrase', id: phrase.id },
        label: { pt: phrase.pt, ru: phrase.ru },
        route: `/cenarios?scene=${encodeURIComponent(phrase.sceneId)}`,
        assets: [pedagogicalAssetRegistry.audio(src, phrase.kind)].filter(Boolean) as PedagogicalAsset[],
        relationRefs: [
          { type: 'scene', id: phrase.sceneId },
          ...(phrase.lexicalItemId ? [{ type: 'lexical-item', id: phrase.lexicalItemId } as KnowledgeEntityRef] : []),
          ...(verb ? [{ type: 'verb', id: verb.id } as KnowledgeEntityRef] : []),
        ],
        metadata: { kind: phrase.kind, sceneId: phrase.sceneId, tokenCount: phrase.pt.split(/\s+/).length, hasContext: true },
      });
    });

    curatedInfinitives.forEach((verb) => {
      const infinitiveAudio = verb.infinitiveAudio ? audioFromDescriptor(verb.infinitiveAudio, 'infinitive') : null;
      this.add({
        ref: { type: 'verb', id: verb.id },
        label: { pt: verb.pt, ru: verb.ru },
        route: `/conjugador?q=${encodeURIComponent(verb.pt)}`,
        assets: [infinitiveAudio].filter(Boolean) as PedagogicalAsset[],
        relationRefs: [
          ...verb.contexts.map((context): KnowledgeEntityRef => ({ type: context.kind, id: context.id })),
          ...verb.relatedExpressions.map((expression): KnowledgeEntityRef => ({ type: 'verb-expression', id: `${verb.id}:${expression.id}` })),
        ],
        metadata: {
          group: verb.group,
          sources: verb.sources,
          hasFullConjugation: verb.hasFullConjugation,
          hasPast: Boolean(verb.pretPerf && verb.pretPeritoRu),
          isReflexive: verb.group === 'reflexive',
        },
      });

      verb.relatedExpressions.forEach((expression) => this.add({
        ref: { type: 'verb-expression', id: `${verb.id}:${expression.id}` },
        label: { pt: expression.pt, ru: expression.ru },
        route: `/conjugador?q=${encodeURIComponent(verb.pt)}`,
        assets: [audioFromDescriptor(expression.audio, 'expression')].filter(Boolean) as PedagogicalAsset[],
        relationRefs: [
          { type: 'verb', id: verb.id },
          ...verb.contexts.map((context): KnowledgeEntityRef => ({ type: context.kind, id: context.id })),
        ],
        metadata: { form: expression.form, tokenCount: expression.pt.split(/\s+/).length, hasContext: true },
      }));
    });

    emotionVocabularyContent.forEach((vocabulary) => {
      const mood = first(emotionMoods.find((item) => item.id === vocabulary.moodId), vocabulary.moodId);
      const learning = first(emotionLearningByMoodId.get(mood.id), mood.id);
      const expressionRefs = vocabulary.expressions.map((expression): KnowledgeEntityRef => ({
        type: 'phrase', id: `emotion:${mood.id}:${expression.id}`,
      }));
      const verbRefs = vocabulary.verbs.flatMap((term): KnowledgeEntityRef[] => {
        const direct = curatedByPt.get(normalize(term.pt));
        const parent = direct ?? curatedInfinitives.find((candidate) =>
          candidate.relatedExpressions.some((expression) => normalize(expression.pt) === normalize(term.pt)));
        return parent ? [{ type: 'verb', id: parent.id }] : [];
      });
      const assets: PedagogicalAsset[] = [
        pedagogicalAssetRegistry.moodImage(emotionCharacters.feminine.id, mood.id),
        pedagogicalAssetRegistry.moodImage('misha', mood.id),
        pedagogicalAssetRegistry.audio(audioAssets.emotion(mood.pt.feminine, 'female'), 'adjective-feminine'),
        pedagogicalAssetRegistry.audio(audioAssets.emotion(mood.pt.masculine, 'male'), 'adjective-masculine'),
      ].filter(Boolean) as PedagogicalAsset[];
      this.add({
        ref: { type: 'emotion', id: mood.id },
        label: {
          pt: mood.pt.feminine === mood.pt.masculine ? mood.pt.feminine : `${mood.pt.feminine} / ${mood.pt.masculine}`,
          ru: mood.ru.feminine === mood.ru.masculine ? mood.ru.feminine : `${mood.ru.feminine} / ${mood.ru.masculine}`,
        },
        route: `/cenarios?collection=emotions&mood=${encodeURIComponent(mood.id)}`,
        assets,
        relationRefs: [...verbRefs, ...expressionRefs],
        metadata: { emoji: mood.emoji, hasProductionPrompt: true, expressionCount: vocabulary.expressions.length },
      });

      vocabulary.expressions.forEach((expression) => this.add({
        ref: { type: 'phrase', id: `emotion:${mood.id}:${expression.id}` },
        label: { pt: expression.pt, ru: expression.ru },
        route: `/cenarios?collection=emotions&mood=${encodeURIComponent(mood.id)}`,
        assets: [pedagogicalAssetRegistry.audio(audioAssets.emotion(expression.pt, 'male'), 'emotion-expression')]
          .filter(Boolean) as PedagogicalAsset[],
        relationRefs: [{ type: 'emotion', id: mood.id }],
        metadata: {
          kind: 'emotion-expression', moodId: mood.id,
          tokenCount: expression.pt.split(/\s+/).length,
          hasContext: true,
          productionPromptPt: learning.contextPrompt.pt,
          productionPromptRu: learning.contextPrompt.ru,
        },
      }));
    });
  }
}

export const pedagogicalEntityRepository = new PedagogicalEntityRepository();
