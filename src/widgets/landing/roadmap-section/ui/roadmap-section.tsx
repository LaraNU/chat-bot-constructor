import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

// Keep copy in sync with docs/roadmap.md
const ROADMAP_GROUPS = [
  {
    titleKey: 'availableTitle',
    keys: ['editor', 'snapshots', 'isolation', 'i18n'] as const,
    prefix: 'available',
  },
  {
    titleKey: 'inProgressTitle',
    keys: ['autosave', 'rateLimit', 'observability'] as const,
    prefix: 'inProgress',
  },
  {
    titleKey: 'plannedTitle',
    keys: ['analytics', 'versions', 'runtime'] as const,
    prefix: 'planned',
  },
] as const;

export function RoadmapSection() {
  const t = useTranslations('Landing.roadmap');

  return (
    <section id="roadmap" className="border-border scroll-mt-20 border-t px-4 py-20 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{t('title')}</h2>
          <p className="text-muted-foreground mt-3">{t('subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {ROADMAP_GROUPS.map((group) => (
            <Card key={group.prefix}>
              <CardHeader>
                <CardTitle>
                  <h3>{t(group.titleKey)}</h3>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm">
                  {group.keys.map((itemKey) => (
                    <li key={itemKey}>{t(`${group.prefix}.${itemKey}`)}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
