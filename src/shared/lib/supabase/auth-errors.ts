export type AuthErrorKey =
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'user_not_found'
  | 'user_already_exists'
  | 'too_many_requests'
  | 'default';

const ERROR_CODE_MAP: Record<string, AuthErrorKey> = {
  invalid_credentials: 'invalid_credentials',
  email_not_confirmed: 'email_not_confirmed',
  user_not_found: 'user_not_found',
  user_already_exists: 'user_already_exists',
  too_many_requests: 'too_many_requests',
};

export function getAuthErrorKey(code: string | undefined): AuthErrorKey {
  if (!code) return 'default';
  return ERROR_CODE_MAP[code] ?? 'default';
}
