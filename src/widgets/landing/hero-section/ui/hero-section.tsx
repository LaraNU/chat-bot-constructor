import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="px-4 py-20 md:px-6 md:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-6xl">
          Build Telegram bots with <span className="text-muted-foreground">visual workflows</span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg text-pretty">
          Create powerful Telegram bots without writing code. Design conversational flows, automate
          responses, and deploy in minutes with our intuitive visual editor.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/signup">
              Start Building Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
