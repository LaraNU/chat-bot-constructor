import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ScopedIntlProvider } from '@/app/providers/scoped-intl-provider';
import { requireAuthenticatedUser } from '@/shared/auth';
import { workflowService } from '@/entities/workflow/server/service';
import { WorkflowEditorPage } from '@/views/workflow-editor';

type EditorPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditorPage({ params }: EditorPageProps) {
  await requireAuthenticatedUser();

  const { id, locale } = await params;
  setRequestLocale(locale);

  if (!id) {
    notFound();
  }

  const workflow = await workflowService.getWorkflowByBotId(id);

  const initialNodes = workflow?.nodes ?? [];
  const initialEdges = workflow?.edges ?? [];

  return (
    <ScopedIntlProvider scopes={['WorkflowEditor', 'WorkflowCanvas', 'PropertiesPanel']}>
      <WorkflowEditorPage botId={id} initialNodes={initialNodes} initialEdges={initialEdges} />
    </ScopedIntlProvider>
  );
}
