import type { Lang } from '../types';

const STORAGE_KEY = 'matrioskinha-lang';

export class PreferencesRepository {
  readLanguage(): Lang {
    if (typeof window === 'undefined') return 'pt';
    return window.localStorage.getItem(STORAGE_KEY) === 'ru' ? 'ru' : 'pt';
  }

  writeLanguage(language: Lang): void {
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, language);
  }
}

export const preferencesRepository = new PreferencesRepository();
