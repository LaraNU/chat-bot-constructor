/**
 * Pure function — determines where to redirect based on path and auth state.
 * Returns the redirect target with locale prefix, or null if no redirect is needed.
 *
 * Locale prefix is extracted from the path (e.g. /ru, /en) so this works
 * both with and without the prefix already present.
 */
export function getAuthRedirect(pathname: string, isAuthenticated: boolean): string | null {
  const localeMatch = pathname.match(/^\/(en|ru)(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : null;
  const prefix = locale ? `/${locale}` : '';

  const withoutLocale = locale ? pathname.slice(prefix.length) || '/' : pathname;

  const isAuthPage = withoutLocale === '/login' || withoutLocale === '/signup';
  const isProtectedPage = withoutLocale.startsWith('/editor');

  if (!isAuthenticated && isProtectedPage) {
    return `${prefix}/login`;
  }

  if (isAuthenticated && isAuthPage) {
    return prefix || '/';
  }

  return null;
}
