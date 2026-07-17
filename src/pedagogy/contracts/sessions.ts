import type { KnowledgeEntityRef } from './entities';
import type { LearningInteraction } from './interactions';

export interface PracticeSession {
  id: string;
  seed: string;
  origin: KnowledgeEntityRef;
  interactions: LearningInteraction[];
}
