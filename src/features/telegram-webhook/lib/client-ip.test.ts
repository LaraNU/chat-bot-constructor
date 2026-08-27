import { describe, expect, test } from 'vitest';
import { NextRequest } from 'next/server';
import { getClientIp } from './client-ip';

describe('getClientIp', () => {
  test('uses the first x-forwarded-for hop', () => {
    const request = new NextRequest('https://app.example.com/api/webhook', {
      headers: { 'x-forwarded-for': '203.0.113.1, 10.0.0.1' },
    });

    expect(getClientIp(request)).toBe('203.0.113.1');
  });

  test('falls back to x-real-ip', () => {
    const request = new NextRequest('https://app.example.com/api/webhook', {
      headers: { 'x-real-ip': '198.51.100.2' },
    });

    expect(getClientIp(request)).toBe('198.51.100.2');
  });

  test('returns unknown when no IP headers are present', () => {
    const request = new NextRequest('https://app.example.com/api/webhook');

    expect(getClientIp(request)).toBe('unknown');
  });
});
