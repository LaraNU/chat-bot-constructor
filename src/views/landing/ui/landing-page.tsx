import { HeroSection } from '@/widgets/landing/hero-section';
import { Footer } from '@/widgets/footer';
import { ScopedIntlProvider } from '@/app/providers/scoped-intl-provider';

export function LandingPage() {
  return (
    <ScopedIntlProvider scopes={['heroSection']}>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <HeroSection />
        </main>
        <Footer />
      </div>
    </ScopedIntlProvider>
  );
}
