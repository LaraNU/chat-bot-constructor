import { describe, expect, test } from 'vitest';
import { getAuthRedirect } from './redirect-rules';

describe('getAuthRedirect — guest', () => {
  test('guest on /ru/editor/123 redirects to /ru/login', () => {
    expect(getAuthRedirect('/ru/editor/123', false)).toBe('/ru/login');
  });

  test('guest on /en/editor/id redirects to /en/login', () => {
    expect(getAuthRedirect('/en/editor/id', false)).toBe('/en/login');
  });

  test('guest on /ru/login — no redirect', () => {
    expect(getAuthRedirect('/ru/login', false)).toBeNull();
  });

  test('guest on /ru/signup — no redirect', () => {
    expect(getAuthRedirect('/ru/signup', false)).toBeNull();
  });

  test('guest on /ru — no redirect', () => {
    expect(getAuthRedirect('/ru', false)).toBeNull();
  });
});

describe('getAuthRedirect — authenticated', () => {
  test('authenticated on /ru/login redirects to /ru', () => {
    expect(getAuthRedirect('/ru/login', true)).toBe('/ru');
  });

  test('authenticated on /en/login redirects to /en', () => {
    expect(getAuthRedirect('/en/login', true)).toBe('/en');
  });

  test('authenticated on /ru/signup redirects to /ru (fixes /sign-up bug)', () => {
    expect(getAuthRedirect('/ru/signup', true)).toBe('/ru');
  });

  test('authenticated on /en/signup redirects to /en', () => {
    expect(getAuthRedirect('/en/signup', true)).toBe('/en');
  });

  test('authenticated on /ru — no redirect', () => {
    expect(getAuthRedirect('/ru', true)).toBeNull();
  });

  test('authenticated on /ru/editor/123 — no redirect', () => {
    expect(getAuthRedirect('/ru/editor/123', true)).toBeNull();
  });
});

describe('getAuthRedirect — locale preservation', () => {
  test('redirect for /ru paths keeps /ru prefix', () => {
    const target = getAuthRedirect('/ru/editor/x', false);
    expect(target).toMatch(/^\/ru/);
  });

  test('redirect for /en paths keeps /en prefix', () => {
    const target = getAuthRedirect('/en/editor/x', false);
    expect(target).toMatch(/^\/en/);
  });
});

describe('getAuthRedirect — paths without locale prefix', () => {
  test('guest on /editor/123 without prefix redirects to /login', () => {
    expect(getAuthRedirect('/editor/123', false)).toBe('/login');
  });

  test('authenticated on /login without prefix redirects to /', () => {
    expect(getAuthRedirect('/login', true)).toBe('/');
  });

  test('authenticated on /signup without prefix redirects to /', () => {
    expect(getAuthRedirect('/signup', true)).toBe('/');
  });
});
