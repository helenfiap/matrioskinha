import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Lang } from '../types';
import ptLocale from '../locales/pt.json';
import ruLocale from '../locales/ru.json';
import { preferencesRepository } from '../repositories/preferencesRepository';

interface LanguageContextValue {
  lang: Lang;
  toggle: () => void;
  setLang: (l: Lang) => void;
  t: (pt: string, ru: string) => string;
  /**
   * Key-based translation lookup, e.g. tk('sidebar.items.minhaTrilha').
   * Reads from src/locales/{pt,ru}.json. This is the newer, catalog-based
   * approach — most of the app still uses the inline t(pt, ru) form above;
   * migrating those calls to locale keys is an ongoing, separate effort.
   */
  tk: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const locales: Record<Lang, unknown> = { pt: ptLocale, ru: ruLocale };

function lookup(obj: unknown, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => preferencesRepository.readLanguage());

  useEffect(() => {
    preferencesRepository.writeLanguage(lang);
    document.documentElement.lang = lang === 'ru' ? 'ru' : 'pt-BR';
  }, [lang]);

  const toggle = () => setLang((prev) => (prev === 'pt' ? 'ru' : 'pt'));
  const t = (pt: string, ru: string) => (lang === 'ru' ? ru : pt);
  const tk = (key: string) => lookup(locales[lang], key) ?? lookup(locales.pt, key) ?? key;

  return (
    <LanguageContext.Provider value={{ lang, toggle, setLang, t, tk }}>
      {children}
    </LanguageContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components -- baseline keeps the provider and its hook colocated; they will be split with the domain-store migration.
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage deve ser usado dentro de LanguageProvider');
  return ctx;
}
