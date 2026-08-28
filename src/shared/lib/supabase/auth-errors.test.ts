import { describe, expect, test } from 'vitest';
import { getAuthErrorKey } from './auth-errors';

describe('getAuthErrorKey', () => {
  test.each([
    ['invalid_credentials', 'invalid_credentials'],
    ['email_not_confirmed', 'email_not_confirmed'],
    ['user_not_found', 'user_not_found'],
    ['user_already_exists', 'user_already_exists'],
    ['too_many_requests', 'too_many_requests'],
  ] as const)('maps %s to %s', (code, expected) => {
    expect(getAuthErrorKey(code)).toBe(expected);
  });

  test('maps unknown code to default', () => {
    expect(getAuthErrorKey('some_unknown_error')).toBe('default');
  });

  test('maps undefined to default', () => {
    expect(getAuthErrorKey(undefined)).toBe('default');
  });
});
