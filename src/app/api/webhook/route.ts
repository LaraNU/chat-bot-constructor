import { NextRequest } from 'next/server';
import { handleTelegramWebhook } from '@/features/telegram-webhook';

export async function POST(request: NextRequest) {
  return handleTelegramWebhook(request);
}
