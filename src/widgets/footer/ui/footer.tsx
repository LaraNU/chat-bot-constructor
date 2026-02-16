import { Link } from '@/i18n/navigation';

export function Footer() {
  return (
    <footer className="border-border border-t px-4 py-6 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="bg-foreground flex h-6 w-6 items-center justify-center rounded">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="text-background h-4 w-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="BotFlow Logo"
            >
              <path d="M12 8V4H8" />
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2" />
              <path d="M20 14h2" />
              <path d="M15 13v2" />
              <path d="M9 13v2" />
            </svg>
          </div>
          <span className="text-muted-foreground text-sm">BotFlow</span>
        </div>
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
