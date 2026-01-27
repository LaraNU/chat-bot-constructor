import { NextResponse } from 'next/server';
import { prisma } from '@/shared/lib/prisma';

export async function GET() {
  try {
    const bots = await prisma.bot.findMany();
    return NextResponse.json(bots);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bots' }, { status: 500 });
  }
}
