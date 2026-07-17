import type { KnowledgeEntityRef } from './entities';
import type { LearningModality, LearningSkill } from './skills';

export interface TeachingProfile {
  entityRef: KnowledgeEntityRef;
  capabilities: LearningSkill[];
  modalities: LearningModality[];
  difficultyRange: [number, number];
  relationRefs: KnowledgeEntityRef[];
  reasons: Partial<Record<LearningSkill, string>>;
  editorialOverrides?: Partial<Record<LearningSkill, boolean>>;
}
