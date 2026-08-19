import { useTranslations } from 'next-intl';
import { GitBranch, Globe, Layers, MousePointer2, ShieldCheck, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

const FEATURES = [
  { key: 'visualEditor', icon: MousePointer2 },
  { key: 'nodeTypes', icon: GitBranch },
  { key: 'publish', icon: Zap },
  { key: 'drafts', icon: Layers },
  { key: 'isolation', icon: ShieldCheck },
  { key: 'bilingual', icon: Globe },
] as const;

export function FeaturesSection() {
  const t = useTranslations('Landing.features');

  return (
    <section id="features" className="border-border scroll-mt-20 border-t px-4 py-20 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{t('title')}</h2>
          <p className="text-muted-foreground mt-3">{t('subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ key, icon: Icon }) => (
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
