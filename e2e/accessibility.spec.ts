import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test('dashboard nao possui violacoes WCAG A ou AA detectaveis automaticamente', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
  expect(results.violations).toEqual([]);
});

test('cenario aberto nao possui violacoes WCAG A ou AA detectaveis automaticamente', async ({ page }) => {
  await page.goto('/#/cenarios');
  await page.getByRole('button', { name: 'o sofá' }).click();

  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
  expect(results.violations).toEqual([]);
});

test('atelie bilingue nao possui violacoes WCAG A ou AA detectaveis automaticamente', async ({ page }) => {
  await page.goto('/#/cenarios');
  await page.getByRole('button', { name: /Ateliê das Emoções/ }).click();

  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
  expect(results.violations).toEqual([]);
});
