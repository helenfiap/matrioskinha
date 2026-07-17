import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../../context/LanguageContext';
import { LearningProvider } from '../../context/LearningContext';
import { PracticeSessionProvider, usePracticeSession } from '../../context/PracticeSessionContext';
import { ProgressProvider } from '../../context/ProgressContext';
import { practicePlanner } from '../../pedagogy/planner';

const session = practicePlanner.plan({ type: 'emotion', id: 'feliz' }, { seed: 'ui-flow' });

function Launcher() {
  const { openPractice } = usePracticeSession();
  return <button onClick={(event) => openPractice(session.origin, { seed: session.seed }, event.currentTarget)}>Abrir prática</button>;
}

function Wrapper() {
  return <LanguageProvider><LearningProvider><ProgressProvider><PracticeSessionProvider><Launcher /></PracticeSessionProvider></ProgressProvider></LearningProvider></LanguageProvider>;
}

describe('PracticeSessionFlow', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', { randomUUID: () => 'practice-attempt' });
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { callback(0); return 1; });
  });

  it('abre pelo contexto, registra Attempt pedagógico e devolve o foco', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const launcher = screen.getByRole('button', { name: 'Abrir prática' });
    await user.click(launcher);
    expect(screen.getByRole('dialog', { name: 'Prática contextual' })).toBeInTheDocument();

    const first = session.interactions[0];
    const answerSpec = first.answerSpec;
    if (answerSpec.kind !== 'single-choice') throw new Error('Interação inesperada');
    const correct = answerSpec.options.find((option) => option.id === answerSpec.correctOptionId)!;
    await user.click(screen.getByRole('button', { name: correct.label.pt }));
    expect(screen.getByText('Correto')).toBeInTheDocument();
    await waitFor(() => {
      const log = JSON.parse(window.localStorage.getItem('matrioskinha-attempts') ?? '{}');
      expect(log.attempts[0].pedagogy).toMatchObject({ skill: 'recognition', generatorId: 'recognition-v1' });
    });

    await user.click(screen.getByRole('button', { name: 'Fechar prática' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(launcher).toHaveFocus();
  });

  it('orienta em russo sem traduzir a questão e mantém todas as respostas em português', async () => {
    window.localStorage.setItem('matrioskinha-lang', 'ru');
    const user = userEvent.setup();
    render(<Wrapper />);
    await user.click(screen.getByRole('button', { name: 'Abrir prática' }));
    const first = session.interactions[0];
    const firstAnswer = first.answerSpec;
    if (firstAnswer.kind !== 'single-choice') throw new Error('Interação inesperada');
    const correct = firstAnswer.options.find((option) => option.id === firstAnswer.correctOptionId)!;
    expect(screen.getByText(first.prompt.ru)).toBeInTheDocument();
    expect(screen.queryByText(first.prompt.pt)).not.toBeInTheDocument();
    expect(screen.getByText('Прослушать слово на португальском')).toBeInTheDocument();
    firstAnswer.options.forEach((option) => {
      expect(screen.getByRole('button', { name: option.label.pt })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: option.label.ru })).not.toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: correct.label.pt }));
    await user.click(screen.getByRole('button', { name: /Далее/ }));

    const association = session.interactions[1];
    if (association.answerSpec.kind !== 'single-choice') throw new Error('Interação inesperada');
    expect(screen.getByText(/Какое выражение подходит к эмоции/)).toBeInTheDocument();
    expect(screen.queryByText(/Qual expressão combina/)).not.toBeInTheDocument();
    association.answerSpec.options.forEach((option) => {
      expect(screen.getByRole('button', { name: option.label.pt })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: option.label.ru })).not.toBeInTheDocument();
    });
  });
});
