import { expect, test } from '@playwright/test';

test('carrega o dashboard e alterna o idioma de forma persistente', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Olá, Demetrio/ })).toBeVisible();
  await page.getByRole('button', { name: 'Русский' }).click();
  await expect(page.getByRole('heading', { name: /Привет, Деметрио/ })).toBeVisible();

  await expect.poll(() => page.evaluate(() => localStorage.getItem('matrioskinha-lang'))).toBe('ru');
});

test('busca um item, abre sua cena e registra a exploracao', async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder(/Buscar verbo/).fill('geladeira');
  await page.getByRole('button', { name: /a geladeira/ }).click();

  await expect(page.getByRole('heading', { name: 'a geladeira' })).toBeVisible();
  await expect.poll(async () => page.evaluate(() => {
    const progress = JSON.parse(localStorage.getItem('matrioskinha-progress') ?? '{}');
    return progress.itemProgress?.cozinha?.geladeira?.intervalIndex;
  })).toBe(1);
});

test('conclui um exercicio e persiste o desafio diario', async ({ page }) => {
  await page.goto('/#/trilha');

  await page.getByRole('button', { name: /Como est.*a senhora/ }).click();
  await page.getByRole('button', { name: 'Oi! Tudo bem?' }).click();
  await expect(page.getByText(/Correto — forma neutra/)).toBeVisible();
  await expect.poll(async () => page.evaluate(() => {
    const progress = JSON.parse(localStorage.getItem('matrioskinha-progress') ?? '{}');
    return progress.challengeDone?.choice;
  })).toBe(true);
  await expect.poll(async () => page.evaluate(() => {
    const log = JSON.parse(localStorage.getItem('matrioskinha-attempts') ?? '{}');
    return log.attempts?.map((attempt: { correct: boolean }) => attempt.correct);
  })).toEqual([false, true]);

  await page.goto('/#/progresso');
  await expect(page.getByRole('heading', { name: 'Erros recorrentes' })).toBeVisible();
  await expect(page.getByRole('cell', { name: /Escolha de registro/ })).toBeVisible();
});

test('recupera um item vencido e o remove da fila de hoje', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('matrioskinha-progress', JSON.stringify({
      itemProgress: {
        sala: { sofa: { intervalIndex: 1, nextReviewDate: '2000-01-01' } },
      },
      challengeDone: { choice: false, flash: false, order: false, listen: false, registro: false },
      challengeDate: '2000-01-01',
      missionsDone: {},
      studyDates: [],
      settings: {},
    }));
  });
  await page.goto('/#/progresso?section=revisao');

  await expect(page.getByText('o sofá').first()).toBeVisible();
  await page.getByRole('button', { name: /mostrar/i }).click();
  await page.getByRole('button', { name: /^Lembrei$/ }).click();

  await expect(page.getByText(/Nada pendente por aqui/)).toBeVisible();
  await expect.poll(async () => page.evaluate(() => {
    const progress = JSON.parse(localStorage.getItem('matrioskinha-progress') ?? '{}');
    return progress.itemProgress?.sala?.sofa?.intervalIndex;
  })).toBe(2);
});

test('inicia uma missao e libera o proximo passo apenas apos a interacao', async ({ page }) => {
  await page.goto('/#/cenarios');

  await page.getByRole('button', { name: /Iniciar missão/ }).click();
  const nextButton = page.getByRole('button', { name: /Próximo passo/ });
  await expect(nextButton).toBeDisabled();

  await page.getByRole('button', { name: 'o sofá' }).click();
  await expect(nextButton).toBeEnabled();
});

test('oferece navegacao funcional em viewport mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(page.getByRole('link', { name: /Cenários/ })).toBeVisible();
  await page.getByRole('link', { name: /Cenários/ }).click();
  await expect(page.getByRole('heading', { name: 'Cenários da casa' })).toBeVisible();
});
