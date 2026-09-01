## Context

See `proposal.md` — Why. `next.config.ts` currently has no `headers()`. Fonts are self-hosted by `next/font/google` in production. The only browser third-party origin today is the Supabase project URL used by `@supabase/ssr`. Telegram (`api.telegram.org`) is called only from the server. `next-themes` injects an inline script before hydration to avoid a theme flash.

## Goals / Non-Goals

**Goals:**
- One global header set via Next.js `headers()`, not per-page.
- Enforcing CSP that matches current origins, not a Report-Only leftover in production (there is no report-uri yet).
- Keep login, dashboard, and editor working without CSP console errors.

**Non-Goals:**
- Nonce/hash CSP that removes `'unsafe-inline'` (needs middleware + Next nonce plumbing).
- Google OAuth / extra third-party origins (add when those features land).
- CSP on webhook JSON responses as a product requirement (global `/:path*` may still attach headers; that is acceptable).
- A reporting endpoint (`report-uri` / `report-to`).

## Decisions

### D1: Configure headers in `next.config.ts`, matcher `/:path*`

**Decision:** Implement `headers()` returning one rule for `source: '/:path*'`.

**Rationale:** Matches the issue and Next.js default for site-wide headers. Avoids duplicating header logic in `middleware.ts` (already composed for i18n + Supabase).

**Alternative considered:** Set headers only in middleware. Would mix auth/i18n with security policy and is easier to miss on some responses.

---

### D2: Pragmatic CSP with `'unsafe-inline'` for scripts and styles

**Decision:** `script-src 'self' 'unsafe-inline'` and `style-src 'self' 'unsafe-inline'`. No `'unsafe-eval'` unless local verification proves React Flow/Next needs it (default: omit).

**Rationale:** Next.js App Router hydration and `next-themes` use inline scripts/styles. A strict nonce CSP is the right long-term bar but is not an S-sized P1.

**Alternative considered:** Nonce via middleware `content-security-policy` + Next.js `nonce` support. Stronger XSS mitigation; deferred.

---

### D3: `connect-src` from `NEXT_PUBLIC_SUPABASE_URL`

**Decision:** Parse the origin from `NEXT_PUBLIC_SUPABASE_URL` at config load and allow that origin for both `https:` and `wss:`. If the env var is missing, fall back to `https://*.supabase.co wss://*.supabase.co` so a misconfigured build still matches typical hosted Auth.

**Rationale:** Avoids hardcoding a project ref. Telegram MUST NOT be listed.

**Alternative considered:** Hardcode the production project URL. Breaks preview/local projects with a different ref.

---

### D4: HSTS only when `NODE_ENV === 'production'`

**Decision:** Append `Strict-Transport-Security: max-age=63072000; includeSubDomains` only for production builds.

**Rationale:** HSTS on localhost can confuse later HTTP local debugging.

---

### D5: Verify with enforcing CSP locally; do not ship Report-Only

**Decision:** After implementation, manually check login, dashboard, and editor in the browser (and curl headers). If a legitimate resource is blocked, widen the policy before merge. Do not merge a Report-Only-only config.

**Rationale:** No report collector exists; Report-Only in production would give a false sense of coverage.

## Risks / Trade-offs

- **`'unsafe-inline'` on script-src** → CSP does not stop all XSS via injected inline scripts. Mitigation: still blocks unexpected origins and framing; nonce CSP is a later P2 hardening.
- **CSP blocks an overlooked origin** → login or editor looks “hung”. Mitigation: verify the three main flows; keep policy in one function so a fix is one edit.
- **Future Google OAuth** → will need `connect-src` / `form-action` / possibly `frame-src` updates. Mitigation: document in README that CSP must be extended when adding third-party auth.

## Migration Plan

1. Add headers in `next.config.ts`.
2. Restart `next dev`, curl a page, confirm header names.
3. Exercise `/login`, `/` (dashboard), `/editor/:id` with DevTools console open.
4. `npm run build`.
5. Deploy; production automatically gets HSTS.

**Rollback:** Revert the `headers()` block in `next.config.ts` and redeploy.
