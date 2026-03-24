import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { isUserAuthenticated } from './shared/auth';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const isAuthenticated = await isUserAuthenticated();

  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname.includes('/login') || pathname.includes('/sign-up');
  const isProtectedPage = pathname.includes('/editor');

  if (!isAuthenticated && isProtectedPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
