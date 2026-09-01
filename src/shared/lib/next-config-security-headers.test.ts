import { describe, expect, test } from 'vitest';
import nextConfig from '../../../next.config';

describe('next.config security headers', () => {
  test('applies security headers to / and /:path*', async () => {
    const config = nextConfig as { headers?: () => Promise<{ source: string }[]> };
    expect(config.headers).toEqual(expect.any(Function));

    const rules = await config.headers!();
    const sources = rules.map((rule) => rule.source);

    expect(sources).toContain('/');
    expect(sources).toContain('/:path*');
  });

  test('disables the X-Powered-By header', () => {
    expect((nextConfig as { poweredByHeader?: boolean }).poweredByHeader).toBe(false);
  });
});
