export type HttpHeader = { key: string; value: string };

const FALLBACK_SUPABASE_CONNECT = ['https://*.supabase.co', 'wss://*.supabase.co'] as const;
const HSTS_VALUE = 'max-age=63072000; includeSubDomains';

function parseSupabaseConnectOrigins(supabaseUrl: string): string[] | null {
  try {
    const origin = new URL(supabaseUrl).origin;
    if (!origin || origin === 'null') {
      return null;
    }

    const websocketOrigin = origin.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:');
    return [origin, websocketOrigin];
  } catch {
    return null;
  }
}

export function getSupabaseConnectOrigins(
  supabaseUrl: string | undefined,
  options?: { isProduction?: boolean }
): string[] {
  const isProduction = options?.isProduction ?? process.env.NODE_ENV === 'production';

  if (supabaseUrl) {
    const parsed = parseSupabaseConnectOrigins(supabaseUrl);
    if (parsed) {
      return parsed;
    }

    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not a valid URL. Refusing to widen Content-Security-Policy connect-src.'
    );
  }

  if (isProduction) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL must be set to a valid URL in production (required for Content-Security-Policy connect-src).'
    );
  }

  return [...FALLBACK_SUPABASE_CONNECT];
}

export function buildContentSecurityPolicy(connectOrigins: string[]): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self' ${connectOrigins.join(' ')}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');
}

export function buildSecurityHeaders(options?: {
  supabaseUrl?: string;
  isProduction?: boolean;
}): HttpHeader[] {
  const supabaseUrl = options?.supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isProduction = options?.isProduction ?? process.env.NODE_ENV === 'production';
  const connectOrigins = getSupabaseConnectOrigins(supabaseUrl, { isProduction });

  const headers: HttpHeader[] = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Content-Security-Policy', value: buildContentSecurityPolicy(connectOrigins) },
  ];

  if (isProduction) {
    headers.push({ key: 'Strict-Transport-Security', value: HSTS_VALUE });
  }

  return headers;
}
