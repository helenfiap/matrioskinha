import type { BilingualText, KnowledgeEntityRef } from './entities';

export interface AnswerOption {
  id: string;
  label: BilingualText;
  entityRef?: KnowledgeEntityRef;
}

export type AnswerSpec =
  | {
      kind: 'single-choice';
      options: AnswerOption[];
      correctOptionId: string;
    }
  | {
      kind: 'ordering';
      tokens: Array<{ id: string; value: string }>;
      correctOrder: string[];
    }
  | {
      kind: 'comparison';
      options: AnswerOption[];
      expectedEntityRef: KnowledgeEntityRef;
    }
  | {
      kind: 'self-assessment';
      scale: Array<{ value: 'again' | 'hard' | 'good' | 'easy'; label: BilingualText }>;
    }
  | {
      kind: 'guided-production';
      rubric: BilingualText[];
      minimumLength?: number;
    };
