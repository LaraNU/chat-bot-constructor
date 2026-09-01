## Why

HTTP responses currently ship with no baseline security headers. The app can be embedded in a foreign iframe, browsers may MIME-sniff responses, and there is no Content-Security-Policy to constrain where scripts and connections may go. This is a public-beta readiness item (GitHub #70 / roadmap P1.10): cheap to add, immediately visible in any security review, and independent of later features such as Google OAuth.

## What Changes

- Add a global `headers()` function in `next.config.ts` so every HTML route receives the same baseline headers.
- Ship `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, clickjacking protection (`X-Frame-Options` and CSP `frame-ancestors`), and a pragmatic `Content-Security-Policy` that still allows Next.js hydration and `next-themes`.
- Allow browser `connect-src` only to `'self'` and the configured Supabase origin (https + wss). Telegram Bot API is server-only and MUST NOT appear in CSP.
- Send `Strict-Transport-Security` only in production HTTPS contexts, not on localhost.
- Document the header set in README and mark P1.10 done in both roadmaps.

Nonce-based CSP (no `'unsafe-inline'` for scripts) is out of scope: it requires middleware coordination with Next.js and is a follow-up, not this P1.

## Capabilities

### New Capabilities

- `security-headers`: HTTP response security headers applied globally, including a CSP compatible with current first-party scripts, styles, fonts, and the Supabase Auth browser client.

### Modified Capabilities

(none)

## Impact

- **`next.config.ts`**: new `headers()` implementation. No new npm dependencies.
- **Browser clients**: Supabase Auth (`@supabase/ssr` in the browser) must remain allowed under `connect-src`. `next-themes` inline script and Next.js hydration require `'unsafe-inline'` on `script-src` / `style-src` for this change.
- **Does not change**: webhook route behavior, Telegram outbound calls, Server Actions, auth business rules.
- **Docs**: `docs/roadmap.md`, `docs/roadmap-ru.md`, `README.md`.
