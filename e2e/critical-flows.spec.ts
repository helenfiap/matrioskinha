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

test('organiza cenarios por colecao e apresenta o Atelie das Emocoes', async ({ page }) => {
  await page.goto('/#/cenarios');

  await expect(page.getByRole('navigation', { name: 'Coleções de cenários' })).toBeVisible();
  await expect(page.locator('.scenario-collections button').first()).toContainText('Ateliê das Emoções');
  await page.getByRole('button', { name: /Ateliê das Emoções/ }).click();

  await expect(page.getByRole('heading', { name: 'Ateliê das Emoções' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Misha Matriôshkin/ })).toBeVisible();
  await expect(page.locator('.mood-learning-card')).toHaveCount(16);
  await expect(page.locator('.mood-learning-card').first().locator('img')).toHaveAttribute('src', /matrioskinha\/feliz\.webp$/);
  await expect(page.getByText('feliz', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('счастливая', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Verbos relacionados' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Expressões relacionadas' })).toBeVisible();
  await expect(page.locator('.emotion-related-block.verbs .emotion-related-item')).toHaveCount(3);
  await expect(page.locator('.emotion-related-block.expressions .emotion-related-item')).toHaveCount(3);
  await expect(page.locator('.emotion-artwork.large img')).toHaveCSS('object-fit', 'contain');
  expect(await page.locator('.emotion-artwork.large').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return rect.width / rect.height;
  })).toBeCloseTo(2 / 3, 2);

  await page.locator('.mood-learning-card').first().click();
  await expect(page.getByRole('heading', { name: 'feliz', exact: true })).toBeVisible();
  await expect(page.getByText('Она счастлива, потому что встретила подругу.')).toBeVisible();
  await expect(page.getByText(/Curiosidade cultural/)).toBeVisible();
  await page.getByRole('button', { name: /Usei no contexto/ }).click();
  await expect.poll(() => page.evaluate(() => {
    const progress = JSON.parse(localStorage.getItem('matrioskinha-progress') ?? '{}');
    return progress.itemProgress?.['emotion-atelier']?.feliz?.intervalIndex;
  })).toBe(2);

  await page.getByRole('button', { name: /Misha Matriôshkin/ }).click();
  await expect(page.locator('.mood-learning-card').first().locator('img')).toHaveAttribute('src', /misha\/feliz\.webp$/);
  await expect(page.getByRole('heading', { name: 'feliz', exact: true })).toBeVisible();
  await expect(page.getByText('счастливый', { exact: true }).first()).toBeVisible();

  await page.getByRole('button', { name: 'Русский' }).click();
  await expect(page.getByRole('heading', { name: 'Ателье эмоций' })).toBeVisible();
  await expect(page.locator('.mood-card-copy strong').first()).toHaveText('счастливый');
  await expect(page.locator('.mood-card-copy span').first()).toHaveText('feliz');
  await expect(page.getByRole('heading', { name: 'счастливый' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Пример в контексте' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Связанные глаголы' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Связанные выражения' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Путешествие по Бразилии/ })).toBeDisabled();
});

test('compacta o seletor do Atelie e leva o detalhe ao foco no mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/cenarios');
  await page.getByRole('button', { name: /Ateliê das Emoções/ }).click();

  await expect(page.locator('.mood-learning-grid')).toHaveCSS('display', 'flex');
  await page.locator('.mood-learning-card').nth(1).click();
  await expect(page.getByRole('heading', { name: 'triste', exact: true })).toBeVisible();
  await expect.poll(() => page.locator('.emotion-detail-card').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.top < window.innerHeight * 0.35;
  })).toBe(true);
});

test('consolida os verbos do produto nas secoes de infinitivo', async ({ page }) => {
  await page.goto('/#/conjugador');

  await expect(page.locator('.infinitive-overview strong').filter({ hasText: '112' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Reflexivos/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Locuções/ })).toBeVisible();

  await page.getByPlaceholder('Buscar verbo (português ou russo)...').fill('acalmar-se');
  await expect(page.locator('.conj-item')).toHaveCount(1);
  await page.locator('.conj-item-head').click();
  await expect(page.getByText(/Este infinitivo já faz parte do vocabulário ativo/)).toBeVisible();
  await expect(page.getByText('calma / calmo', { exact: true })).toBeVisible();
  await expect(page.getByText('irritada / irritado', { exact: true })).toBeVisible();
});
