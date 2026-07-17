import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../../../context/LanguageContext';
import { ChoiceExercise } from './ChoiceExercise';

describe('ChoiceExercise', () => {
  it('explica o erro e conclui somente com a resposta correta', async () => {
    const user = userEvent.setup();
    const onCorrect = vi.fn();
    render(
      <LanguageProvider>
        <ChoiceExercise onCorrect={onCorrect} />
      </LanguageProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Como está a senhora?' }));
    expect(screen.getByText(/Tente novamente/)).toBeInTheDocument();
    expect(onCorrect).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Oi! Tudo bem?' }));
    expect(screen.getByText(/Correto/)).toBeInTheDocument();
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });
});
