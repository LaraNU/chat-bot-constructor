import { test, expect } from '@playwright/test';

test('should open modal, fill form and redirect to editor', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('open-create-bot-modal').click();
  await expect(page.getByTestId('create-bot-modal-title')).toBeVisible();

  const uniqueName = `Bot ${Date.now()}`;
  await page.getByTestId('bot-name-input').fill(uniqueName);
  await page.getByTestId('bot-description-input').fill('E2E Test Bot description');

  const createBotResponse = page.waitForResponse(
    (res) =>
      res.url().includes('/api/bots') && res.request().method() === 'POST' && res.status() === 201
  );

  await page.getByTestId('submit-create-bot-modal').click();
  await createBotResponse;

  await expect(page).toHaveURL(/\/editor\/[a-zA-Z0-9-]+$/, { timeout: 15000 });
  await expect(page.getByTestId('editor-root')).toBeVisible({ timeout: 15000 });
});
