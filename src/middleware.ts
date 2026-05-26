import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const allCookies = request.cookies.getAll();

  const hasAuthCookie = allCookies.some((cookie) => cookie.name.includes('auth-token'));

  const isAuthPage = pathname.includes('/login') || pathname.includes('/sign-up');
  const isProtectedPage = pathname.includes('/editor') || pathname.includes('/dashboard');

  if (!hasAuthCookie && isProtectedPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (hasAuthCookie && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|trpc|_next/static|_next/image|_vercel|assets|favicon.ico|.*\\..*).*)'],
};
