interface TelegramWebhookResponse {
  ok: boolean;
  description?: string;
}

export async function setTelegramWebhook(
  token: string,
  botId: string,
  appUrl: string
): Promise<void> {
  const webhookUrl = `${appUrl}/api/webhook?botId=${botId}&token=${token}`;

  const telegramUrl = `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;

  const response = await fetch(telegramUrl, { method: 'POST' });

  if (!response.ok) {
    throw new Error(`Telegram network error: ${response.statusText}`);
  }

  const data = (await response.json()) as TelegramWebhookResponse;

  if (!data.ok) {
    throw new Error(data.description || 'Failed to set webhook');
  }
}
