import type { PropsWithChildren } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { LanguageProvider, useLanguage } from './LanguageContext';

function wrapper({ children }: PropsWithChildren) {
  return <LanguageProvider>{children}</LanguageProvider>;
}

describe('LanguageProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.lang = '';
  });

  it('inicia em portugues e persiste a troca para russo', async () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });

    expect(result.current.lang).toBe('pt');
    expect(result.current.t('ola', 'привет')).toBe('ola');

    act(() => result.current.setLang('ru'));

    expect(result.current.lang).toBe('ru');
    expect(result.current.t('ola', 'привет')).toBe('привет');
    await waitFor(() => {
      expect(window.localStorage.getItem('matrioskinha-lang')).toBe('ru');
      expect(document.documentElement.lang).toBe('ru');
    });
  });

  it('carrega o idioma salvo e oferece fallback de catalogo para portugues', () => {
    window.localStorage.setItem('matrioskinha-lang', 'ru');
    const { result } = renderHook(() => useLanguage(), { wrapper });

    expect(result.current.lang).toBe('ru');
    expect(result.current.tk('sidebar.items.cenarios')).toBe('Сцены');
    expect(result.current.tk('chave.inexistente')).toBe('chave.inexistente');
  });
});
