import type { NextRequest } from 'next/server';

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const firstForwarded = forwarded?.split(',')[0]?.trim();

  if (firstForwarded) {
    return firstForwarded;
  }

  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}
