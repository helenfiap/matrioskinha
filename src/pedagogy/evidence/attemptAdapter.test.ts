import { describe, expect, it } from 'vitest';
import { attemptSchema } from '../../content/schemas';
import { practicePlanner } from '../planner';
import { interactionToAttempt } from './attemptAdapter';

describe('interactionToAttempt', () => {
  it('preserva entidade, habilidade, gerador, interação e sessão', () => {
    const session = practicePlanner.plan({ type: 'emotion', id: 'feliz' }, { seed: 'evidence' });
    const interaction = session.interactions[0];
    const input = interactionToAttempt(session, interaction, false, 1234.4);
    expect(input).toMatchObject({
      itemType: 'emotion', correct: false, durationMs: 1234,
      errorCode: 'recognition-error',
      pedagogy: {
        entityRef: { type: 'emotion', id: 'feliz' }, skill: 'recognition',
        generatorId: 'recognition-v1', interactionId: interaction.id, sessionId: session.id,
      },
    });
    expect(attemptSchema.safeParse({ ...input, id: 'attempt-test', userId: 'local-user', answeredAt: '2026-07-17T12:00:00.000Z' }).success).toBe(true);
  });
});
