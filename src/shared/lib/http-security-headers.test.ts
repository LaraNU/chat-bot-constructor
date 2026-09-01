import { describe, expect, test } from 'vitest';
import { buildSecurityHeaders, getSupabaseConnectOrigins } from './http-security-headers';

const SUPABASE_URL = 'https://abcd.supabase.co';

function headerValue(headers: { key: string; value: string }[], key: string): string | undefined {
  return headers.find((header) => header.key === key)?.value;
}

describe('getSupabaseConnectOrigins', () => {
  test('derives https and wss origins from a valid Supabase URL', () => {
    expect(getSupabaseConnectOrigins(SUPABASE_URL, { isProduction: true })).toEqual([
      'https://abcd.supabase.co',
      'wss://abcd.supabase.co',
    ]);
    expect(getSupabaseConnectOrigins(SUPABASE_URL, { isProduction: false })).toEqual([
      'https://abcd.supabase.co',
      'wss://abcd.supabase.co',
    ]);
  });

  test('falls back to supabase.co wildcards when URL is missing in development', () => {
    expect(getSupabaseConnectOrigins(undefined, { isProduction: false })).toEqual([
      'https://*.supabase.co',
      'wss://*.supabase.co',
    ]);
  });

  test('throws when URL is missing in production', () => {
    expect(() => getSupabaseConnectOrigins(undefined, { isProduction: true })).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL must be set/
    );
  });

  test('throws on an invalid URL in production instead of widening CSP', () => {
    expect(() => getSupabaseConnectOrigins('not-a-url', { isProduction: true })).toThrow(
      /not a valid URL/
    );
  });

  test('throws on an invalid URL in development instead of widening CSP', () => {
    expect(() => getSupabaseConnectOrigins('not-a-url', { isProduction: false })).toThrow(
      /not a valid URL/
    );
  });
});

describe('buildSecurityHeaders', () => {
  test('includes baseline headers and an enforcing CSP', () => {
    const headers = buildSecurityHeaders({ supabaseUrl: SUPABASE_URL, isProduction: false });
    const keys = headers.map((header) => header.key);

    expect(keys).toEqual([
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Permissions-Policy',
      'X-Frame-Options',
      'Content-Security-Policy',
    ]);
    expect(headerValue(headers, 'X-Content-Type-Options')).toBe('nosniff');
    expect(headerValue(headers, 'Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headerValue(headers, 'X-Frame-Options')).toBe('DENY');
    expect(headerValue(headers, 'Permissions-Policy')).toContain('camera=()');
  });

  test('CSP allows Supabase connect origins and forbids framing, plugins, and Telegram', () => {
    const csp = headerValue(
      buildSecurityHeaders({ supabaseUrl: SUPABASE_URL, isProduction: false }),
      'Content-Security-Policy'
    );

    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain('https://abcd.supabase.co');
    expect(csp).toContain('wss://abcd.supabase.co');
    expect(csp).not.toContain('api.telegram.org');
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).not.toContain('*.supabase.co');
  });

  test('adds HSTS only in production', () => {
    const dev = buildSecurityHeaders({ supabaseUrl: SUPABASE_URL, isProduction: false });
    const prod = buildSecurityHeaders({ supabaseUrl: SUPABASE_URL, isProduction: true });

    expect(headerValue(dev, 'Strict-Transport-Security')).toBeUndefined();
    expect(headerValue(prod, 'Strict-Transport-Security')).toBe(
      'max-age=63072000; includeSubDomains'
    );
  });

  test('throws in production when supabaseUrl is missing', () => {
    const original = process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    try {
      expect(() => buildSecurityHeaders({ isProduction: true })).toThrow(
        /NEXT_PUBLIC_SUPABASE_URL must be set/
      );
    } finally {
      if (original === undefined) {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      } else {
        process.env.NEXT_PUBLIC_SUPABASE_URL = original;
      }
    }
  });
});
