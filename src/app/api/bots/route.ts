import { NextResponse } from 'next/server';
import { botService } from '@/entities/bot/server/service';
import { createClient } from '@/shared/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await botService.getAllBots(user.id);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('GET /api/bots error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const bot = await botService.createNewBot({
      ...body,
      userId: user.id,
    });

    return NextResponse.json(bot, { status: 201 });
  } catch (error) {
    console.error('POST /api/bots error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: String(error) },
      { status: 500 }
    );
  }
}
