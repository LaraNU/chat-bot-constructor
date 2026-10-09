import { Link } from '@/i18n/navigation';
import { BrandMark } from '@/shared/ui/brand-mark';

export function Footer() {
  return (
    <footer className="border-border border-t px-4 py-6 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <BrandMark
          name="BotFlow"
          iconBoxClassName="h-6 w-6 rounded"
          iconClassName="h-4 w-4"
          nameClassName="text-muted-foreground inline-block text-sm font-normal tracking-normal"
        />
        <div className="flex gap-6">
          <Link
            href="https://github.com/LaraNU/chat-bot-constructor"
            className="text-muted-foreground hover:text-foreground text-sm"
            target="_blank"
          >
            Github
          </Link>
        </div>
      </div>
    </footer>
  );
}
