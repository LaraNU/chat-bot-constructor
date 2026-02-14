import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('should open sign up page', async ({ page }) => {
  await page.goto('/login');

  await page.getByTestId('signup-link').click();

  await page.waitForURL('**/signup');

  await expect(page).toHaveURL(/.*\/signup/);
});

test('should login user', async ({ page }) => {
  await page.goto('/login');

  await page.getByTestId('user-email-input-login').fill(process.env.TEST_USER_EMAIL!);
  await page.getByTestId('user-password-input-login').fill(process.env.TEST_USER_PASSWORD!);
  await page.waitForLoadState('networkidle');
  await page.getByTestId('submit-sign-in-form-login').click();

  await expect(page.getByTestId('sign-out-button')).toBeVisible({ timeout: 15000 });
});

test('should show error with invalid credentials', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('user-email-input-login').fill('wrong@gmail.com');
  await page.getByTestId('user-password-input-login').fill('wrongpassword');
  await page.getByTestId('submit-sign-in-form-login').click();

  await expect(
    page.getByText(
      /Invalid email or password. Please try again|Неверная почта или пароль. Попробуйте снова/i
    )
  ).toBeVisible();
});
