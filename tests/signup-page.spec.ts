import { test, expect, Page } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

async function typeIntoInputByTestId(page: Page, testId: string, value: string) {
  const input = page.getByTestId(testId);
  await input.click();
  await input.clear();
  await input.pressSequentially(value);
  await expect(input).toHaveValue(value);
}

test('should open login page from sign up page', async ({ page }) => {
  await page.goto('/signup');

  await page.locator('main a[href$="/login"]').click();

  await page.waitForURL('**/login');
  await expect(page).toHaveURL(/.*\/login/);
});

test('should show validation errors for empty fields', async ({ page }) => {
  await page.goto('/signup');

  await page.getByTestId('submit-sign-up-form').click();

  await expect(page.locator('[data-slot="field-error"]')).toHaveCount(3);
});

test('should submit sign up form and toggle loading state', async ({ page }) => {
  await page.goto('/signup');

  await page.route('**/auth/v1/signup**', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 700));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: null, session: null }),
    });
  });

  await typeIntoInputByTestId(page, 'user-name-input', 'Playwright User');
  await typeIntoInputByTestId(page, 'user-email-input', `pw-${Date.now()}@example.com`);
  await typeIntoInputByTestId(page, 'user-password-input', 'strongpass123');

  const submitButton = page.getByTestId('submit-sign-up-form');
  await submitButton.click();

  await expect(submitButton).toBeDisabled();
  await expect(submitButton).toBeEnabled({ timeout: 10000 });
});
