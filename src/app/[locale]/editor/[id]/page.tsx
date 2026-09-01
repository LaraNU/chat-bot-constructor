import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ScopedIntlProvider } from '@/app/providers/scoped-intl-provider';
import { requireAuthenticatedUser } from '@/shared/auth';
import { workflowService } from '@/entities/workflow/server/service';
import { botService } from '@/entities/bot/server';
import { NotFoundError } from '@/shared/api/errors';
import { WorkflowEditorPage } from '@/views/workflow-editor';
import type { Bot } from '@prisma/client';

type EditorPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditorPage({ params }: EditorPageProps) {
  const user = await requireAuthenticatedUser();
  const { id, locale } = await params;
  setRequestLocale(locale);

  if (!id) {
    notFound();
  }

  let bot: Bot;
  try {
    bot = await botService.assertBotOwnership(user.id, id);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const workflow = await workflowService.getWorkflowByBotId(id);
  const initialNodes = workflow?.nodes ?? [];
  const initialEdges = workflow?.edges ?? [];
  const hasToken = Boolean(bot.token);

  return (
    <ScopedIntlProvider scopes={['WorkflowEditor', 'WorkflowCanvas', 'PropertiesPanel']}>
      <WorkflowEditorPage
        botId={id}
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        hasToken={hasToken}
      />
    </ScopedIntlProvider>
  );
}
