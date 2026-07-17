import { describe, expect, it } from 'vitest';
import { evaluateAnswer } from './interactionEvaluator';

describe('evaluateAnswer', () => {
  it('avalia escolha e ordenação sem coerção', () => {
    expect(evaluateAnswer({
      kind: 'single-choice', options: [
        { id: 'a', label: { pt: 'A', ru: 'А' } }, { id: 'b', label: { pt: 'B', ru: 'Б' } },
      ], correctOptionId: 'a',
    }, { kind: 'single-choice', optionId: 'a' })).toBe(true);
    expect(evaluateAnswer({
      kind: 'ordering', tokens: [{ id: 'a', value: 'Eu' }, { id: 'b', value: 'vou' }], correctOrder: ['a', 'b'],
    }, { kind: 'ordering', tokenIds: ['b', 'a'] })).toBe(false);
  });
});
