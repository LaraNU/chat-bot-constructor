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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const dataForService = {
      ...body,
      userId: 'temp-user-id',
    };

    const newBot = await botService.createNewBot(dataForService);

    return NextResponse.json(newBot, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
