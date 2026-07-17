import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('matrioskinha-feature-pedagogical-cycle', 'true'));
});

test('executa três interações contextuais e persiste a evidência P2', async ({ page }) => {
  await page.goto('/#/cenarios?collection=emotions&mood=surpresa');
  const trigger = page.getByRole('button', { name: /^Praticar agora P2$/ });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Prática contextual' });
  await expect(dialog).toBeVisible();
  const pronunciation = dialog.getByRole('button', { name: 'Ouvir: palavra em português' });
  const mediaResponse = page.waitForResponse((response) => response.url().includes('/emotions/female/surpresa-'));
  await pronunciation.click();
  expect((await mediaResponse).ok()).toBe(true);
  await expect(pronunciation).not.toHaveClass(/error/);

  for (let step = 0; step < 3; step += 1) {
    await dialog.locator('.practice-options button').first().click();
    await expect(dialog.locator('.practice-feedback')).toBeVisible();
    await dialog.getByRole('button', { name: step === 2 ? /Concluir/ : /Próximo/ }).click();
  }
  await expect(dialog.getByRole('heading', { name: 'Sessão concluída' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const log = JSON.parse(localStorage.getItem('matrioskinha-attempts') ?? '{}');
    return log.attempts?.map((attempt: { pedagogy?: { skill: string; generatorId: string } }) => attempt.pedagogy);
  })).toEqual([
    expect.objectContaining({ skill: 'recognition', generatorId: 'recognition-v1' }),
    expect.objectContaining({ skill: 'association', generatorId: 'association-v1' }),
    expect.objectContaining({ skill: 'conjugation', generatorId: 'conjugation-v1' }),
  ]);
  await dialog.getByRole('button', { name: 'Voltar ao conteúdo' }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('drawer P2 funciona no mobile, prende o foco e passa no axe', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/conjugador?q=pegar');
  const trigger = page.getByRole('button', { name: /^Praticar P2$/ });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Prática contextual' });
  await expect(dialog).toBeVisible();
  const results = await new AxeBuilder({ page }).include('.practice-drawer').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
