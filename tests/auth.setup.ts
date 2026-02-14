import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');

  await page.getByTestId('user-email-input-login').fill(process.env.TEST_USER_EMAIL!);
  await page.getByTestId('user-password-input-login').fill(process.env.TEST_USER_PASSWORD!);
  await page.waitForLoadState('networkidle');
  await page.getByTestId('submit-sign-in-form-login').click();

  await page.waitForURL(/.*\/(en|ru)/, { timeout: 15000 });

  const createBotButton = page.getByTestId('open-create-bot-modal');

  await expect(createBotButton).toBeVisible({ timeout: 15000 });

  await page.context().storageState({ path: authFile });
});
