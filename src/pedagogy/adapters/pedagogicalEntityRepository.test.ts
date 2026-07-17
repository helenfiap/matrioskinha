import { describe, expect, it } from 'vitest';
import { entityRefKey } from '../contracts';
import { pedagogicalEntityRepository as repository } from './pedagogicalEntityRepository';

describe('PedagogicalEntityRepository', () => {
  it('adapta todo o acervo entregue para uma taxonomia única', () => {
    expect(repository.list()).toHaveLength(505);
    expect(repository.list('lexical-item')).toHaveLength(89);
    expect(repository.list('scene-occurrence')).toHaveLength(90);
    expect(repository.list('verb')).toHaveLength(112);
    expect(repository.list('verb-expression')).toHaveLength(3);
    expect(repository.list('emotion')).toHaveLength(16);
    expect(repository.list('phrase')).toHaveLength(187);
    expect(repository.list('scene')).toHaveLength(8);
  });

  it('mantém chaves únicas e todas as relações resolvíveis', () => {
    const keys = repository.list().map((item) => entityRefKey(item.ref));
    expect(new Set(keys).size).toBe(keys.length);
    expect(repository.unresolvedRelations()).toEqual([]);
  });

  it('conecta locução, infinitivo e cenário sem duplicar a expressão', () => {
    const pegar = repository.get({ type: 'verb', id: 'pegar' });
    const expressionRef = pegar?.relationRefs.find((ref) => ref.type === 'verb-expression');
    const expression = expressionRef ? repository.get(expressionRef) : undefined;
    expect(expressionRef?.id).toContain('pegar-o-onibus');
    expect(expression?.label.pt).toBe('pegar o ônibus');
    expect(expression?.relationRefs).toContainEqual({ type: 'scene', id: 'transporte' });
    expect(expression?.assets.some((asset) => asset.type === 'audio' && asset.status === 'validated')).toBe(true);
  });

  it('conecta uma emoção aos verbos e às três expressões do Ateliê', () => {
    const surprise = repository.get({ type: 'emotion', id: 'surpresa' });
    expect(surprise?.relationRefs.filter((ref) => ref.type === 'verb')).toHaveLength(3);
    expect(surprise?.relationRefs.filter((ref) => ref.type === 'phrase')).toHaveLength(3);
  });
});
