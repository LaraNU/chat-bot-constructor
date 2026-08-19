import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

const STEP_KEYS = ['create', 'design', 'publish', 'chat'] as const;

export function HowItWorksSection() {
  const t = useTranslations('Landing.howItWorks');

  return (
    <section id="how-it-works" className="border-border scroll-mt-20 border-t px-4 py-20 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{t('title')}</h2>
          <p className="text-muted-foreground mt-3">{t('subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {STEP_KEYS.map((key, index) => (
            <Card key={key}>
              <CardHeader>
                <p className="text-muted-foreground text-sm font-medium">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <CardTitle>
                  <h3>{t(`steps.${key}.title`)}</h3>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t(`steps.${key}.description`)}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
