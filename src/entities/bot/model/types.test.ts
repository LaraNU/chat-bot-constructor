import { describe, expect, test } from 'vitest';

import { getBotStatus } from './types';

describe('getBotStatus', () => {
  const flowUpdatedAt = new Date('2026-02-17T12:00:00.000Z');
  const earlierSnapshot = new Date('2026-02-17T10:00:00.000Z');
  const laterSnapshot = new Date('2026-02-17T14:00:00.000Z');

  test('returns draft when the bot has no token', () => {
    expect(
      getBotStatus({
        token: null,
        flowUpdatedAt,
        snapshotUpdatedAt: earlierSnapshot,
      })
    ).toBe('draft');
  });

  test('returns published when flow and snapshot timestamps are equal', () => {
    expect(
      getBotStatus({
        token: 'token',
        flowUpdatedAt,
        snapshotUpdatedAt: flowUpdatedAt,
      })
    ).toBe('published');
  });

  test('returns published when the snapshot is newer than the flow (fresh publish)', () => {
    expect(
      getBotStatus({
        token: 'token',
        flowUpdatedAt,
        snapshotUpdatedAt: laterSnapshot,
      })
    ).toBe('published');
  });

  test('returns published_with_changes when the flow was saved after the last publish', () => {
    expect(
      getBotStatus({
        token: 'token',
        flowUpdatedAt,
        snapshotUpdatedAt: earlierSnapshot,
      })
    ).toBe('published_with_changes');
  });

  test('returns published when snapshot or flow timestamp is missing but token exists', () => {
    expect(
      getBotStatus({
        token: 'token',
        flowUpdatedAt: null,
        snapshotUpdatedAt: earlierSnapshot,
      })
    ).toBe('published');

    expect(
      getBotStatus({
        token: 'token',
        flowUpdatedAt,
        snapshotUpdatedAt: null,
      })
    ).toBe('published');
  });
});
