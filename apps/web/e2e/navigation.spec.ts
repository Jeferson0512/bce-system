import { expect, test } from '@playwright/test';

test('loads the dashboard and navigates to operations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Buenos días, Jeferson/ })).toBeVisible();
  await page.getByRole('link', { name: 'Operaciones' }).click();
  await expect(page).toHaveURL(/\/operaciones$/);
  await expect(page.getByRole('heading', { name: 'Nueva operación', exact: true })).toBeVisible();
});

test('builds and saves a multi-item operation', async ({ page }) => {
  await page.goto('/operaciones');
  await page.getByLabel('Profesor').selectOption('T03');
  await page.getByLabel('Tipo de servicio').selectOption('copia_bn');
  await page.getByLabel('Salón').selectOption('P2A');
  await page.getByLabel('Cantidad').fill('10');
  await page.getByRole('button', { name: 'Agregar al pedido' }).click();
  await expect(page.getByText('Subtotal del ítem')).toBeVisible();
  await expect(page.locator('.order-panel .operation-item b').filter({ hasText: 'S/ 1.00' })).toBeVisible();
  await page.getByRole('button', { name: 'Guardar operación' }).click();
  await expect(page.getByText('Operación guardada correctamente en el repositorio local.')).toBeVisible();
});
