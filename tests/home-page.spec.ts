import { test, expect } from '@playwright/test';

test('should open modal, fill form and redirect to editor', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('open-create-bot-modal').click();
  await expect(page.getByTestId('create-bot-modal-title')).toBeVisible();

  const uniqueName = `Bot ${Math.random().toString(36).substring(7)}`;
  await page.getByTestId('bot-name-input').fill(uniqueName);
  await page.getByTestId('bot-description-input').fill('E2E Test Bot description');

  await page.waitForLoadState('networkidle');

  await page.getByTestId('submit-create-bot-modal').click();

  await page.waitForResponse((res) => res.url().includes('/api/bots') && res.status() === 201);

  await page.waitForURL(/.*\/editor\/[a-zA-Z0-9-]+/, { timeout: 15000 });

  await expect(page.getByTestId('editor-root')).toBeVisible({ timeout: 15000 });
});
