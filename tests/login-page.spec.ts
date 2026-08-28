import { test, expect, Page } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

async function typeIntoInputByTestId(page: Page, testId: string, value: string) {
  const input = page.getByTestId(testId);
  await input.click();
  await input.clear();
  await input.pressSequentially(value);
  await expect(input).toHaveValue(value);
}

test('should open sign up page', async ({ page }) => {
  await page.goto('/login');

  await page.getByTestId('signup-link').click();

  await page.waitForURL('**/signup');

  await expect(page).toHaveURL(/.*\/signup/);
});

test('should login user', async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  expect(email, 'TEST_USER_EMAIL must be set for E2E auth tests').toBeTruthy();
  expect(password, 'TEST_USER_PASSWORD must be set for E2E auth tests').toBeTruthy();

  await page.goto('/login');

  await typeIntoInputByTestId(page, 'user-email-input-login', email!);
  await typeIntoInputByTestId(page, 'user-password-input-login', password!);

  await Promise.all([
    page.waitForURL(/\/(en|ru)\/?$/, { timeout: 10000 }),
    page.getByTestId('submit-sign-in-form-login').click(),
  ]);

  await expect(page.getByTestId('open-create-bot-modal')).toBeVisible({ timeout: 10000 });
});

test('should show error with invalid credentials', async ({ page }) => {
  await page.goto('/login');
  await typeIntoInputByTestId(page, 'user-email-input-login', 'wrong@gmail.com');
  await typeIntoInputByTestId(page, 'user-password-input-login', 'wrongpassword');
  await page.getByTestId('submit-sign-in-form-login').click();

  await expect(page).toHaveURL(/\/(en|ru)\/login$/);
  await expect(page.getByTestId('sign-out-button')).toHaveCount(0);
});
