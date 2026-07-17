import type { AnswerSpec } from '../contracts';

export type InteractionResponse =
  | { kind: 'single-choice'; optionId: string }
  | { kind: 'ordering'; tokenIds: string[] }
  | { kind: 'comparison'; entityType: string; entityId: string }
  | { kind: 'self-assessment'; value: 'again' | 'hard' | 'good' | 'easy' }
  | { kind: 'guided-production'; text: string };

export function evaluateAnswer(answerSpec: AnswerSpec, response: InteractionResponse): boolean {
  if (answerSpec.kind === 'single-choice' && response.kind === 'single-choice') {
    return response.optionId === answerSpec.correctOptionId;
  }
  if (answerSpec.kind === 'ordering' && response.kind === 'ordering') {
    return answerSpec.correctOrder.join('|') === response.tokenIds.join('|');
  }
  if (answerSpec.kind === 'comparison' && response.kind === 'comparison') {
    return answerSpec.expectedEntityRef.type === response.entityType && answerSpec.expectedEntityRef.id === response.entityId;
  }
  return answerSpec.kind === 'self-assessment' || answerSpec.kind === 'guided-production';
}
