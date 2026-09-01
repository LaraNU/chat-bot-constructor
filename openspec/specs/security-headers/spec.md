## Purpose

Defines the HTTP security headers every browser response must carry so pages cannot be framed by third parties, scripts and connections are constrained, and existing login, dashboard, and editor flows still work.

## Requirements

### Requirement: Baseline security headers are present on HTML responses

The system SHALL include at least `X-Content-Type-Options: nosniff`, a restrictive `Referrer-Policy`, a `Permissions-Policy` that disables unused powerful features, and clickjacking protection equivalent to denying framing (`X-Frame-Options: DENY` or CSP `frame-ancestors 'none'`).

#### Scenario: Login page response includes the baseline headers

- **WHEN** a client requests the login page
- **THEN** the response includes `X-Content-Type-Options: nosniff`
- **AND** the response includes a `Referrer-Policy`
- **AND** the response includes clickjacking protection that denies embedding in a foreign frame

#### Scenario: Editor page response includes the same headers

- **WHEN** a client requests a workflow editor page
- **THEN** the same baseline headers are present as on the login page

### Requirement: Content-Security-Policy constrains scripts, styles, and connections

The system SHALL send an enforcing `Content-Security-Policy` on HTML responses. The policy MUST allow first-party scripts, styles, images, and fonts required to render the app, and MUST allow browser connections to the configured Supabase origin over HTTPS and WebSocket. The policy MUST NOT allow framing by other origins. The policy MUST NOT require the Telegram Bot API as a browser connect target.

#### Scenario: Browser may call Supabase Auth

- **WHEN** a signed-in or signing-in user loads a page that uses the browser Supabase client
- **THEN** CSP `connect-src` allows the configured Supabase HTTPS origin
- **AND** CSP `connect-src` allows the corresponding Supabase WebSocket origin

#### Scenario: Third-party framing is forbidden by CSP

- **WHEN** an HTML response is returned
- **THEN** CSP includes `frame-ancestors` that allows only no framing (or equivalent `'none'`)

#### Scenario: Telegram API is not a browser CSP target

- **WHEN** CSP is applied
- **THEN** `connect-src` does not list `api.telegram.org`

### Requirement: Existing product flows keep working under CSP

The system SHALL NOT ship a CSP that blocks first-party hydration, theme initialization, editor canvas rendering, or authentication against Supabase from the browser.

#### Scenario: Sign-in still reaches the dashboard

- **WHEN** a user submits valid credentials on the login page
- **THEN** the browser console has no CSP-blocked script or connect errors that prevent navigation to the dashboard

#### Scenario: Workflow editor canvas loads

- **WHEN** an authenticated user opens the workflow editor
- **THEN** the canvas, node palette, and styles render
- **AND** the browser console has no CSP-blocked resource errors for first-party scripts, styles, or fonts

### Requirement: HSTS is applied only on production HTTPS

The system SHALL send `Strict-Transport-Security` on production HTTPS deployments. The system MUST NOT send HSTS on local development responses in a way that pins HTTPS for localhost.

#### Scenario: Production response includes HSTS

- **WHEN** an HTML response is served in a production HTTPS environment
- **THEN** the response includes `Strict-Transport-Security`

#### Scenario: Local development does not pin HSTS on localhost

- **WHEN** an HTML response is served from local development
- **THEN** the response does not include `Strict-Transport-Security` for localhost
