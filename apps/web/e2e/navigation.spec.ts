import { expect, test } from '@playwright/test';

test('loads the dashboard and navigates to operations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Buenos días, Jeferson/ })).toBeVisible();
  await page.getByRole('link', { name: 'Operaciones' }).click();
  await expect(page).toHaveURL(/\/operaciones$/);
  await expect(page.getByRole('heading', { name: 'Operaciones', exact: true })).toBeVisible();
});
