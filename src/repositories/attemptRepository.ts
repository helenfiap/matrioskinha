import { z } from 'zod';
import { attemptSchema, type Attempt } from '../content/schemas';

const STORAGE_KEY = 'matrioskinha-attempts';
const attemptLogSchema = z.object({ schemaVersion: z.literal(1), attempts: z.array(attemptSchema).max(1000) });

export class AttemptRepository {
  read(): Attempt[] {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const result = attemptLogSchema.safeParse(JSON.parse(raw));
      return result.success ? result.data.attempts : [];
    } catch { return []; }
  }

  write(attempts: readonly Attempt[]): void {
    if (typeof window === 'undefined') return;
    const bounded = attempts.slice(-1000);
    const log = attemptLogSchema.parse({ schemaVersion: 1, attempts: bounded });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  }

  clear(): void {
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
  }
}

export const attemptRepository = new AttemptRepository();
