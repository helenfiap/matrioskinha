export const learningSkills = [
  'discovery',
  'recognition',
  'association',
  'listening',
  'ordering',
  'conjugation',
  'application',
  'transfer',
  'production',
  'review',
] as const;

export type LearningSkill = (typeof learningSkills)[number];

export const interactionKinds = [
  'exercise',
  'comparison',
  'challenge',
  'conversation',
  'micro-mission',
  'guided-production',
] as const;

export type InteractionKind = (typeof interactionKinds)[number];

export const learningModalities = ['text', 'audio', 'image', 'scene'] as const;
export type LearningModality = (typeof learningModalities)[number];
