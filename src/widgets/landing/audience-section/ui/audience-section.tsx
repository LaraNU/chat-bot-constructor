import { useTranslations } from 'next-intl';
import { Briefcase, Building2, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

const SEGMENTS = [
  { key: 'makers', icon: User },
  { key: 'agencies', icon: Briefcase },
  { key: 'teams', icon: Building2 },
] as const;

export function AudienceSection() {
  const t = useTranslations('Landing.audience');

  return (
    <section id="audience" className="border-border scroll-mt-20 border-t px-4 py-20 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{t('title')}</h2>
          <p className="text-muted-foreground mt-3">{t('subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {SEGMENTS.map(({ key, icon: Icon }) => (
            <Card key={key}>
              <CardHeader>
                <div className="bg-muted mb-2 flex h-10 w-10 items-center justify-center rounded-lg">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <CardTitle>
                  <h3>{t(`items.${key}.title`)}</h3>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t(`items.${key}.description`)}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
