import { createClient } from '@/shared/lib/supabase/server';
import { BotDashboard } from '@/widgets/bot-dashboard';
import { Footer } from '@/widgets/footer';
import { HeroSection } from '@/widgets/landing/hero-section';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return <BotDashboard />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}
