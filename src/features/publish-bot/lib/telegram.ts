interface TelegramWebhookResponse {
  ok: boolean;
  description?: string;
}

/**
 * Registers the Telegram webhook for a bot.
 *
 * The webhook URL intentionally carries only `botId`, never the bot token —
 * anyone who intercepts or logs the URL (proxies, browser history, error
 * trackers) must not be able to extract a live bot token from it. Telegram
 * authenticates its requests to this URL via `secretToken`, delivered in the
 * `X-Telegram-Bot-Api-Secret-Token` header on every update.
 */
export async function setTelegramWebhook(
  token: string,
  botId: string,
  appUrl: string,
  secretToken: string
): Promise<void> {
  const webhookUrl = `${appUrl}/api/webhook?botId=${botId}`;

  const telegramUrl =
    `https://api.telegram.org/bot${token}/setWebhook` +
    `?url=${encodeURIComponent(webhookUrl)}` +
    `&secret_token=${encodeURIComponent(secretToken)}`;

  const response = await fetch(telegramUrl, { method: 'POST' });

  if (!response.ok) {
    throw new Error(`Telegram network error: ${response.statusText}`);
  }

  const data = (await response.json()) as TelegramWebhookResponse;

  if (!data.ok) {
    throw new Error(data.description || 'Failed to set webhook');
  }
}
