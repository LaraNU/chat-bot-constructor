import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

function expectBaselineSecurityHeaders(headers: Record<string, string>) {
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(headers['content-security-policy']).toContain("object-src 'none'");
}

test('root response includes security headers', async ({ request }) => {
  const response = await request.get('/', { maxRedirects: 0 });

  expect(response.status()).toBe(307);
  expectBaselineSecurityHeaders(response.headers());
});

test('middleware 307 to login includes security headers from next.config', async ({ request }) => {
  const response = await request.get('/ru/editor/00000000-0000-0000-0000-000000000000', {
    maxRedirects: 0,
  });

  expect(response.status()).toBe(307);
  expect(response.headers()['location']).toMatch(/login/);
  expectBaselineSecurityHeaders(response.headers());
});
