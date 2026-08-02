import { vi, beforeEach, describe, test, expect } from 'vitest';
import { setTelegramWebhook } from './telegram';

describe('setTelegramWebhook', () => {
  const mockToken = '123456:abcDEF-token';
  const mockBotId = 'bot-uuid-1234';
  const mockAppUrl = 'https://app.example.com';
  const mockSecretToken = 'a'.repeat(64);

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ ok: true }),
      })
    );
  });

  test('should register a webhook URL that carries only botId, never the bot token', async () => {
    await setTelegramWebhook(mockToken, mockBotId, mockAppUrl, mockSecretToken);

    const [calledUrl] = vi.mocked(fetch).mock.calls[0];
    const registeredWebhookUrl = new URL(calledUrl as string).searchParams.get('url');

    expect(registeredWebhookUrl).toBe(`${mockAppUrl}/api/webhook?botId=${mockBotId}`);
    expect(registeredWebhookUrl).not.toContain(mockToken);
  });

  test('should pass the secret token to Telegram so it can be echoed back on every update', async () => {
    await setTelegramWebhook(mockToken, mockBotId, mockAppUrl, mockSecretToken);

    const [calledUrl] = vi.mocked(fetch).mock.calls[0];
    const decodedUrl = decodeURIComponent(calledUrl as string);

    expect(decodedUrl).toContain(`secret_token=${mockSecretToken}`);
  });

  test('should call the Telegram API for the given bot token', async () => {
    await setTelegramWebhook(mockToken, mockBotId, mockAppUrl, mockSecretToken);

    const [calledUrl, options] = vi.mocked(fetch).mock.calls[0];

    expect(calledUrl).toContain(`https://api.telegram.org/bot${mockToken}/setWebhook`);
    expect(options).toEqual({ method: 'POST' });
  });

  test('should throw when the network request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, statusText: 'Service Unavailable' })
    );

    await expect(
      setTelegramWebhook(mockToken, mockBotId, mockAppUrl, mockSecretToken)
    ).rejects.toThrow('Telegram network error: Service Unavailable');
  });

  test('should throw when Telegram rejects the request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ ok: false, description: 'Bot was blocked' }),
      })
    );

    await expect(
      setTelegramWebhook(mockToken, mockBotId, mockAppUrl, mockSecretToken)
    ).rejects.toThrow('Bot was blocked');
  });
});
