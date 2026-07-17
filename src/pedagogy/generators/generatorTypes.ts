import type { LearningInteraction, PedagogicalEntity, PracticeContext } from '../contracts';

export interface GeneratorInput {
  entity: PedagogicalEntity;
  context: PracticeContext;
  seed: string;
  sequence: number;
}

export interface SkillGenerator {
  readonly id: string;
  canGenerate(entity: PedagogicalEntity): boolean;
  generate(input: GeneratorInput): LearningInteraction;
}
