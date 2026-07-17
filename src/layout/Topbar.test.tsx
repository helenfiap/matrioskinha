import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LanguageProvider } from '../context/LanguageContext';
import { Topbar } from './Topbar';

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="rota atual">{location.pathname + location.search}</output>;
}

describe('Topbar', () => {
  it('busca uma entidade e navega para a ocorrencia exata', async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Topbar onMenuClick={() => undefined} />
          <LocationProbe />
        </MemoryRouter>
      </LanguageProvider>
    );

    await user.type(screen.getByPlaceholderText(/Buscar verbo/), 'geladeira');
    const label = await screen.findByText('a geladeira');
    await user.click(label.closest('button')!);

    expect(screen.getByLabelText('rota atual')).toHaveTextContent('/cenarios?scene=cozinha&hotspot=geladeira');
  });

  it('nao abre resultados para consultas menores que dois caracteres', async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Topbar onMenuClick={() => undefined} />
        </MemoryRouter>
      </LanguageProvider>
    );

    await user.type(screen.getByPlaceholderText(/Buscar verbo/), 'a');
    expect(screen.queryByText('Nada encontrado.')).not.toBeInTheDocument();
  });
});
