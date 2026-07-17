import { pedagogicalEntityRepository } from '../adapters';
import { entityRefKey, type KnowledgeEntityRef, type LearningInteraction, type PracticeSession } from '../contracts';
import { associationGenerator, conjugationGenerator, recognitionGenerator } from '../generators';
import { deterministicOrder, hashSeed, stableIdPart } from '../generators/deterministic';
import { createPracticeContext, teachingProfileResolver, type PracticeContextOptions } from '../profiles';
import { validateInteraction } from '../validation';

export interface PracticePlanOptions extends PracticeContextOptions {
  seed?: string;
}

export class PracticePlanner {
  plan(origin: KnowledgeEntityRef, options: PracticePlanOptions = {}): PracticeSession {
    const entity = pedagogicalEntityRepository.get(origin);
    if (!entity) throw new Error(`Origem pedagógica ausente: ${entityRefKey(origin)}`);
    const seed = options.seed ?? entityRefKey(origin);
    const context = createPracticeContext(entity, teachingProfileResolver.resolve(entity), options);
    const interactions: LearningInteraction[] = [];

    interactions.push(validateInteraction(recognitionGenerator.generate({ entity, context, seed, sequence: 0 })));
    if (associationGenerator.canGenerate(entity)) {
      interactions.push(validateInteraction(associationGenerator.generate({ entity, context, seed, sequence: 1 })));
    }

    const relatedVerb = entity.ref.type === 'verb'
      ? entity
      : deterministicOrder(
        entity.relationRefs.filter((ref) => ref.type === 'verb').map((ref) => pedagogicalEntityRepository.get(ref)).filter((item) => item !== undefined),
        `${seed}:related-verb`, (item) => entityRefKey(item.ref),
      ).find((item) => conjugationGenerator.canGenerate(item));
    if (relatedVerb && conjugationGenerator.canGenerate(relatedVerb)) {
      interactions.push(validateInteraction(conjugationGenerator.generate({ entity: relatedVerb, context, seed, sequence: interactions.length })));
    }

    const relatedEntities = deterministicOrder(
      entity.relationRefs.map((ref) => pedagogicalEntityRepository.get(ref)).filter((item) => item !== undefined),
      `${seed}:related-recognition`, (item) => entityRefKey(item.ref),
    );
    while (interactions.length < 3) {
      const target = relatedEntities[(interactions.length - 1) % Math.max(1, relatedEntities.length)] ?? entity;
      interactions.push(validateInteraction(recognitionGenerator.generate({
        entity: target, context, seed: `${seed}:fill:${interactions.length}`, sequence: interactions.length,
      })));
    }

    return {
      id: `session:${stableIdPart(entityRefKey(origin))}:${hashSeed(seed).toString(36)}`,
      seed, origin, interactions: interactions.slice(0, 3),
    };
  }
}

export const practicePlanner = new PracticePlanner();
