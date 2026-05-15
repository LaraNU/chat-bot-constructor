import { WorkflowEditorPage } from '@/views/workflow-editor';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ScopedIntlProvider } from '@/app/providers/scoped-intl-provider';

type EditorPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditorPage({ params }: EditorPageProps) {
  const { id, locale } = await params;

  setRequestLocale(locale);

  if (!id) {
    notFound();
  }

  return (
    <ScopedIntlProvider scopes={['WorkflowEditor', 'WorkflowCanvas', 'PropertiesPanel']}>
      <WorkflowEditorPage botId={id} />
    </ScopedIntlProvider>
  );
}
