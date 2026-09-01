import { vi, describe, test, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePublishBot } from './use-publish-bot';
import { publishBotAction } from '../api/actions';

vi.mock('../api/actions', () => ({
  publishBotAction: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/entities/workflow/model/store', () => ({
  useWorkflowNodes: vi.fn(() => []),
  useWorkflowEdges: vi.fn(() => []),
  useIsDirty: vi.fn(() => false),
}));

vi.mock('@/entities/workflow', () => ({
  validateWorkflow: vi.fn(() => ({ isValid: true, errorCount: 0 })),
}));

vi.mock('sonner', () => ({
  toast: {
    warning: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const BOT_ID = 'bot-123';
const MOCK_TOKEN = '123456:abcDEF-token';

describe('usePublishBot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('dialogVariant is "input-token" when hasToken is false', () => {
    const { result } = renderHook(() => usePublishBot({ botId: BOT_ID, hasToken: false }));
    expect(result.current.dialogVariant).toBe('input-token');
  });

  test('dialogVariant is "confirm" when hasToken is true', () => {
    const { result } = renderHook(() => usePublishBot({ botId: BOT_ID, hasToken: true }));
    expect(result.current.dialogVariant).toBe('confirm');
  });

  test('openDialog opens the dialog when workflow is valid and not dirty', () => {
    const { result } = renderHook(() => usePublishBot({ botId: BOT_ID, hasToken: false }));
    act(() => result.current.openDialog());
    expect(result.current.isDialogOpen).toBe(true);
  });

  test('publish in input-token mode calls publishBotAction with botId and token', async () => {
    vi.mocked(publishBotAction).mockResolvedValue({ success: true });

    const { result } = renderHook(() => usePublishBot({ botId: BOT_ID, hasToken: false }));

    act(() => {
      result.current.openDialog();
      result.current.setToken(MOCK_TOKEN);
    });

    await act(async () => {
      result.current.publish();
    });

    expect(publishBotAction).toHaveBeenCalledWith({ botId: BOT_ID, token: MOCK_TOKEN });
  });

  test('publish in confirm mode calls publishBotAction with only botId (no token)', async () => {
    vi.mocked(publishBotAction).mockResolvedValue({ success: true });

    const { result } = renderHook(() => usePublishBot({ botId: BOT_ID, hasToken: true }));

    act(() => result.current.openDialog());

    await act(async () => {
      result.current.publish();
    });

    expect(publishBotAction).toHaveBeenCalledWith({ botId: BOT_ID });
  });

  test('publish in input-token mode shows error toast when token is empty', async () => {
    const { toast } = await import('sonner');

    const { result } = renderHook(() => usePublishBot({ botId: BOT_ID, hasToken: false }));
    act(() => result.current.openDialog());

    await act(async () => {
      result.current.publish();
    });

    expect(publishBotAction).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  test('publish closes dialog on success', async () => {
    vi.mocked(publishBotAction).mockResolvedValue({ success: true });

    const { result } = renderHook(() => usePublishBot({ botId: BOT_ID, hasToken: true }));

    act(() => result.current.openDialog());
    expect(result.current.isDialogOpen).toBe(true);

    await act(async () => {
      result.current.publish();
    });

    expect(result.current.isDialogOpen).toBe(false);
  });

  test('publish shows error toast on action failure', async () => {
    vi.mocked(publishBotAction).mockResolvedValue({ success: false, error: 'Some error' });
    const { toast } = await import('sonner');

    const { result } = renderHook(() => usePublishBot({ botId: BOT_ID, hasToken: true }));
    act(() => result.current.openDialog());

    await act(async () => {
      result.current.publish();
    });

    expect(toast.error).toHaveBeenCalledWith('Some error');
    expect(result.current.isDialogOpen).toBe(true);
  });
});
