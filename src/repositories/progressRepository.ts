import { userProgressSchema, type UserProgress } from '../content/schemas';

const STORAGE_KEY = 'matrioskinha-progress';

export class ProgressRepository {
  readRaw(): unknown | null {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as unknown; } catch { return null; }
  }

  read(): UserProgress | null {
    const result = userProgressSchema.safeParse(this.readRaw());
    return result.success ? result.data : null;
  }

  write(progress: UserProgress): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgressSchema.parse(progress)));
  }

  clear(): void {
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
  }
}

export const progressRepository = new ProgressRepository();
