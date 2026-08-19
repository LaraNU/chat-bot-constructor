import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';

export function HeroSection() {
  const t = useTranslations('Landing.hero');

  return (
    <section id="hero" className="px-4 py-20 md:px-6 md:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-6xl">
          {t('title')} <span className="text-muted-foreground">{t('titleHighlight')}</span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg text-pretty">
          {t('subtitle')}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/signup">
              {t('primaryCta')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">{t('secondaryCta')}</Link>
          </Button>
        </div>
      </div>

      <div className="relative mx-auto mt-16 max-w-5xl">
        <span className="bg-background text-muted-foreground absolute top-3 right-3 z-10 rounded-full border px-3 py-1 text-xs">
          {t('previewBadge')}
        </span>
        <div className="border-border overflow-hidden rounded-xl border shadow-sm">
          <Image
            src="/landing/hero-editor.svg"
            alt={t('imageAlt')}
            width={960}
            height={600}
            className="h-auto w-full"
            priority
          />
        </div>
      </div>
    </section>
  );
}
