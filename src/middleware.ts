import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { createMiddlewareClient } from '@/shared/lib/supabase/middleware';
import { getAuthRedirect } from '@/shared/lib/auth/redirect-rules';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Let next-intl handle locale routing and produce the base response.
  const response = intlMiddleware(request);

  // 2. Attach a Supabase client that reads cookies from the request and
  //    writes refreshed cookies into the response produced in step 1.
  const supabase = createMiddlewareClient(request, response);

  // getUser() validates the session with Supabase Auth and, if the access
  // token is expired, silently refreshes it — writing the new token back
  // into `response` via the cookie handlers above.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectTarget = getAuthRedirect(request.nextUrl.pathname, user !== null);

  if (redirectTarget) {
    const url = request.nextUrl.clone();
    url.pathname = redirectTarget;
    const redirectResponse = NextResponse.redirect(url);

    // Copy the refreshed session cookies onto the redirect response so the
    // browser doesn't lose the updated token on the next request.
    response.cookies.getAll().forEach(({ name, value, ...rest }) => {
      redirectResponse.cookies.set(name, value, rest);
    });

    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|trpc|_next/static|_next/image|_vercel|assets|favicon.ico|.*\\..*).*)'],
};
