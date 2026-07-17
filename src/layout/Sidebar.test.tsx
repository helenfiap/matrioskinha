import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../context/LanguageContext';
import { Sidebar } from './Sidebar';

function renderSidebar(route = '/') {
  render(
    <LanguageProvider>
      <MemoryRouter
        initialEntries={[route]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Sidebar open onClose={vi.fn()} />
      </MemoryRouter>
    </LanguageProvider>
  );
}

describe('Sidebar', () => {
  it('organiza os destinos pela jornada pedagogica do produto', () => {
    renderSidebar();

    const labels = within(screen.getByRole('complementary'))
      .getAllByRole('link')
      .map((link) => link.textContent?.trim());

    expect(labels).toEqual([
      'Visão geral',
      'Minha trilha',
      'Continuar aula',
      'Ateliê das Emoções',
      'Cenários',
      'Vocabulário visual',
      'Brasil real',
      'Conjugador de verbos',
      'Tu × você',
      'Áudio e pronúncia',
      'Banco de exercícios',
      'Revisão',
      'Desempenho',
      'Preferências',
    ]);
  });

  it('destaca somente o atalho especifico dentro de uma rota compartilhada', () => {
    renderSidebar('/cenarios?collection=emotions');

    expect(screen.getByRole('link', { name: /Ateliê das Emoções/ }))
      .toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /^Cenários$/ }))
      .not.toHaveAttribute('aria-current');
  });

  it('mantem a rota-base ativa quando a consulta nao representa outro atalho', () => {
    renderSidebar('/cenarios?scene=cozinha&hotspot=geladeira');

    expect(screen.getByRole('link', { name: /^Cenários$/ }))
      .toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /Ateliê das Emoções/ }))
      .not.toHaveAttribute('aria-current');
  });
});
