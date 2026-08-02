'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

import './globals.css';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[global-error-boundary]', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-col items-center text-center">
              <AlertTriangle className="text-destructive mb-2 size-10" aria-hidden />
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>
                A critical error occurred and the application could not recover. Please try again or
                reload the page.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button onClick={reset}>Try again</Button>
              <Button variant="outline" asChild>
                {/* A plain anchor forces a full page reload rather than client-side routing,
                    which may itself be part of what's broken when this screen renders. */}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href="/">Go to homepage</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
