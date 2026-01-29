import { NextResponse } from 'next/server';
import { botService } from '@/entities/bot/server/service';

export async function GET() {
  try {
    const data = await botService.getAllBots();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
