import { test as setup, expect, Page } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

async function typeIntoInputByTestId(page: Page, testId: string, value: string) {
  const input = page.getByTestId(testId);
  await input.click();
  await input.clear();
  await input.pressSequentially(value);
  await expect(input).toHaveValue(value);
}

setup('authenticate', async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  expect(email, 'TEST_USER_EMAIL must be set for E2E auth tests').toBeTruthy();
  expect(password, 'TEST_USER_PASSWORD must be set for E2E auth tests').toBeTruthy();

  await page.goto('/login');

  await typeIntoInputByTestId(page, 'user-email-input-login', email!);
  await typeIntoInputByTestId(page, 'user-password-input-login', password!);
  await page.getByTestId('submit-sign-in-form-login').click();

  await page.waitForURL(/\/(en|ru)\/?$/, { timeout: 15000 });

  const createBotButton = page.getByTestId('open-create-bot-modal');

  await expect(createBotButton).toBeVisible({ timeout: 15000 });

  await page.context().storageState({ path: authFile });
});
