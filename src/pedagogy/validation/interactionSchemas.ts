import { z } from 'zod';
import { interactionKinds, learningSkills } from '../contracts/skills';
import { knowledgeEntityTypes } from '../contracts/entities';
import type { LearningInteraction } from '../contracts/interactions';

const idSchema = z.string().min(1);
const bilingualSchema = z.object({ pt: z.string().min(1), ru: z.string().min(1) });

export const knowledgeEntityRefSchema = z.object({
  type: z.enum(knowledgeEntityTypes),
  id: idSchema,
});

export const pedagogicalAssetSchema = z.object({
  id: idSchema,
  type: z.enum(['audio', 'image', 'scene']),
  src: z.string().min(1),
  status: z.enum(['validated', 'declared', 'fallback']),
  role: z.string().min(1).optional(),
});

const answerOptionSchema = z.object({
  id: idSchema,
  label: bilingualSchema,
  entityRef: knowledgeEntityRefSchema.optional(),
});

export const answerSpecSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('single-choice'),
    options: z.array(answerOptionSchema).min(2),
    correctOptionId: idSchema,
  }).superRefine((answer, ctx) => {
    const ids = answer.options.map((option) => option.id);
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: 'custom', message: 'Opções duplicadas.' });
    if (!ids.includes(answer.correctOptionId)) ctx.addIssue({ code: 'custom', message: 'Resposta correta não pertence às opções.' });
  }),
  z.object({
    kind: z.literal('ordering'),
    tokens: z.array(z.object({ id: idSchema, value: z.string().min(1) })).min(2),
    correctOrder: z.array(idSchema).min(2),
  }).superRefine((answer, ctx) => {
    const tokenIds = answer.tokens.map((token) => token.id);
    if (new Set(tokenIds).size !== tokenIds.length) ctx.addIssue({ code: 'custom', message: 'Tokens duplicados.' });
    if (
      answer.correctOrder.length !== tokenIds.length
      || new Set(answer.correctOrder).size !== tokenIds.length
      || answer.correctOrder.some((id) => !tokenIds.includes(id))
    ) {
      ctx.addIssue({ code: 'custom', message: 'Ordem correta não corresponde aos tokens.' });
    }
  }),
  z.object({
    kind: z.literal('comparison'),
    options: z.array(answerOptionSchema).min(2),
    expectedEntityRef: knowledgeEntityRefSchema,
  }),
  z.object({
    kind: z.literal('self-assessment'),
    scale: z.array(z.object({
      value: z.enum(['again', 'hard', 'good', 'easy']),
      label: bilingualSchema,
    })).min(2),
  }),
  z.object({
    kind: z.literal('guided-production'),
    rubric: z.array(bilingualSchema).min(1),
    minimumLength: z.number().int().positive().optional(),
  }),
]);

export const practiceContextSchema = z.object({
  origin: knowledgeEntityRefSchema,
  originRoute: z.string().min(1),
  sceneId: idSchema.optional(),
  moodId: idSchema.optional(),
  selectedGender: z.enum(['feminine', 'masculine']).optional(),
  supportLanguage: z.boolean(),
  availableAssets: z.object({ audio: z.boolean(), image: z.boolean(), scene: z.boolean() }),
});

export const learningInteractionSchema: z.ZodType<LearningInteraction> = z.object({
  id: idSchema,
  kind: z.enum(interactionKinds),
  sourceEntityRefs: z.array(knowledgeEntityRefSchema).min(1),
  generatorId: idSchema,
  skill: z.enum(learningSkills),
  difficulty: z.number().int().min(1).max(5),
  estimatedSeconds: z.number().int().positive(),
  dependencies: z.array(idSchema),
  tags: z.array(z.string().min(1)),
  context: practiceContextSchema,
  prompt: bilingualSchema,
  assets: z.array(pedagogicalAssetSchema).optional(),
  answerSpec: answerSpecSchema,
  feedback: z.object({ correct: bilingualSchema, incorrect: bilingualSchema }),
  nextRecommendation: z.object({
    skill: z.enum(learningSkills),
    entityRef: knowledgeEntityRefSchema.optional(),
  }).optional(),
  provenance: z.enum(['generated', 'editorial']),
});
