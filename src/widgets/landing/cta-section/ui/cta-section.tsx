import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';

export function CtaSection() {
  const t = useTranslations('Landing.cta');

  return (
    <section id="cta" className="border-border px-4 py-20 md:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{t('title')}</h2>
        <p className="text-muted-foreground mt-3">{t('subtitle')}</p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/signup">
            {t('button')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
