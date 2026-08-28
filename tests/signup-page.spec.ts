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

test('should toggle loading state around a failed sign-up request', async ({ page }) => {
  await page.goto('/signup');

  // A successful sign-up navigates the user away and keeps the button locked
  // until the component unmounts, so we exercise the loading toggle on the
  // error path — which is the only path that resets `isLoading` on the same
  // page.
  await page.route('**/auth/v1/signup**', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 700));
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 'user_already_exists',
        error_code: 'user_already_exists',
        msg: 'User already registered',
      }),
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

test('should redirect to dashboard after successful sign-up', async ({ page }) => {
  const email = `pw-${Date.now()}@example.com`;

  await page.goto('/signup');

  await page.route('**/auth/v1/signup**', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'test-user-id', email },
        session: { access_token: 'fake-token', refresh_token: 'fake-refresh' },
      }),
    });
  });

  await typeIntoInputByTestId(page, 'user-name-input', 'Playwright User');
  await typeIntoInputByTestId(page, 'user-email-input', email);
  await typeIntoInputByTestId(page, 'user-password-input', 'strongpass123');

  await page.getByTestId('submit-sign-up-form').click();

  await page.waitForURL(/\/(en|ru)\/?$/, { timeout: 8000 });
  await expect(page).toHaveURL(/\/(en|ru)\/?$/);
});
