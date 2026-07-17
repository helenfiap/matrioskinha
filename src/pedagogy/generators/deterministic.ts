export function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function deterministicOrder<T>(items: readonly T[], seed: string, key: (item: T) => string): T[] {
  return [...items].sort((left, right) => {
    const delta = hashSeed(`${seed}:${key(left)}`) - hashSeed(`${seed}:${key(right)}`);
    return delta || key(left).localeCompare(key(right));
  });
}

export function stableIdPart(value: string): string {
  return value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9:-]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
}
