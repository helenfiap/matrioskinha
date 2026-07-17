import type { AnswerSpec } from './answers';
import type { BilingualText, KnowledgeEntityRef, PedagogicalAsset } from './entities';
import type { InteractionKind, LearningSkill } from './skills';

export interface PracticeContext {
  origin: KnowledgeEntityRef;
  originRoute: string;
  sceneId?: string;
  moodId?: string;
  selectedGender?: 'feminine' | 'masculine';
  supportLanguage: boolean;
  availableAssets: {
    audio: boolean;
    image: boolean;
    scene: boolean;
  };
}

export interface LearningInteraction {
  id: string;
  kind: InteractionKind;
  sourceEntityRefs: KnowledgeEntityRef[];
  generatorId: string;
  skill: LearningSkill;
  difficulty: number;
  estimatedSeconds: number;
  dependencies: string[];
  tags: string[];
  context: PracticeContext;
  prompt: BilingualText;
  assets?: PedagogicalAsset[];
  answerSpec: AnswerSpec;
  feedback: {
    correct: BilingualText;
    incorrect: BilingualText;
  };
  nextRecommendation?: {
    skill: LearningSkill;
    entityRef?: KnowledgeEntityRef;
  };
  provenance: 'generated' | 'editorial';
}
