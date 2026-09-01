## 1. Header builder

- [x] 1.1 Add `src/shared/lib/http-security-headers.ts` that builds the header list: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` disabling camera/microphone/geolocation, `X-Frame-Options: DENY`, enforcing CSP (`default-src 'self'`, `script-src`/`style-src` with `'self' 'unsafe-inline'`, `img-src 'self' data: blob:`, `font-src 'self'`, `connect-src` `'self'` + Supabase https/wss origins, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`), no `api.telegram.org`, no `'unsafe-eval'` unless verification later requires it
- [x] 1.2 Derive Supabase origins from `NEXT_PUBLIC_SUPABASE_URL`; if unset, fall back to `https://*.supabase.co` and `wss://*.supabase.co`
- [x] 1.3 Append `Strict-Transport-Security` only when `NODE_ENV === 'production'`
- [x] 1.4 Export from `src/shared/lib/http-security-headers` (or a slice `index.ts` if one is added) so `next.config.ts` can import the builder

## 2. Wire into Next.js

- [x] 2.1 Add `headers()` in `next.config.ts` applying the builder result to `source: '/:path*'`

## 3. Tests

- [x] 3.1 Unit-test the builder: baseline header names present; CSP includes `frame-ancestors 'none'` and Supabase connect origins; CSP does not include `api.telegram.org`; HSTS present only when `NODE_ENV` is `production`

## 4. Verification

- [x] 4.1 Confirm headers on login and editor responses (curl or DevTools Network)
- [x] 4.2 Exercise login → dashboard and editor canvas in the browser; no CSP-blocked first-party scripts, styles, fonts, or Supabase connects
- [x] 4.3 Run `npm run build`

## 5. Docs

- [x] 5.1 Document the header set and the need to extend CSP when adding third-party auth (e.g. Google OAuth) in `README.md`
- [x] 5.2 Mark P1.10 done in `docs/roadmap.md` and `docs/roadmap-ru.md`
