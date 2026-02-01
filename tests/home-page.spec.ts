import { test, expect } from '@playwright/test';

test('should open modal, fill form and redirect to editor', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('open-create-bot-modal').click();
  await expect(page.getByTestId('create-bot-modal-title')).toBeVisible();

  await page.getByTestId('bot-name-input').fill('E2E Test Bot');
  await page.getByTestId('bot-description-input').fill('E2E Test Bot description');

  await page.getByTestId('submit-create-bot-modal').click();

  await expect(page).toHaveURL(/\/editor\/[a-zA-Z0-9-]+/);
});
