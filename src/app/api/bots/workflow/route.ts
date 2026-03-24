import { NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import { workflowService } from '@/entities/workflow/server/service';
import { ApiError, UnauthorizedError, ValidationError } from '@/shared/api/errors';

const catchApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error('GET /api/bots/workflow error:', error);
  return NextResponse.json(
    { error: 'Internal Server Error', details: String(error) },
    { status: 500 }
  );
};

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new UnauthorizedError();
    }

    const url = new URL(req.url);
    const botId = url.searchParams.get('botId');

    if (!botId) {
      throw new ValidationError('botId is required');
    }

    const workflow = await workflowService.getWorkflowByBotId(botId);

    if (!workflow) {
      return NextResponse.json({ nodes: [], edges: [] }, { status: 200 });
    }

    return NextResponse.json({ nodes: workflow.nodes, edges: workflow.edges }, { status: 200 });
  } catch (error) {
    return catchApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new UnauthorizedError();
    }

    const body = await req.json();

    const { botId, nodes, edges } = body;

    if (!botId) {
      throw new ValidationError('botId is required');
    }

    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      throw new ValidationError('Invalid payload: nodes/edges must be arrays');
    }

    try {
      const workflow = await workflowService.saveWorkflow(botId, nodes, edges);
      return NextResponse.json({ ...workflow }, { status: 200 });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        throw new ValidationError(serviceError.message);
      }
      throw serviceError;
    }
  } catch (error) {
    return catchApiError(error);
  }
}
