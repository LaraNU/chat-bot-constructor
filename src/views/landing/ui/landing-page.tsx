import { HeroSection } from '@/widgets/landing/hero-section';
import { HowItWorksSection } from '@/widgets/landing/how-it-works-section';
import { FeaturesSection } from '@/widgets/landing/features-section';
import { AudienceSection } from '@/widgets/landing/audience-section';
import { RoadmapSection } from '@/widgets/landing/roadmap-section';
import { CtaSection } from '@/widgets/landing/cta-section';
import { LandingHeader } from '@/widgets/landing/landing-header';
import { Footer } from '@/widgets/footer';

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <AudienceSection />
        <RoadmapSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
