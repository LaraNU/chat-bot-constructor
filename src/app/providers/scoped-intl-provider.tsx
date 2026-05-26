import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ReactNode } from 'react';

type MessageKeys = keyof AbstractIntlMessages;

type ScopedIntlProviderProps = {
  scopes: MessageKeys[];
  children: ReactNode;
};

export async function ScopedIntlProvider({ scopes, children }: ScopedIntlProviderProps) {
  const allMessages = await getMessages();

  const scopedMessages: Record<string, unknown> = {};

  scopes.forEach((scope) => {
    if (scope in allMessages) {
      scopedMessages[scope] = allMessages[scope];
    }
  });

  return (
    <NextIntlClientProvider messages={scopedMessages as AbstractIntlMessages}>
      {children}
    </NextIntlClientProvider>
  );
}
