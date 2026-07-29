import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { restoreDocument, setDocument, setDocumentHasFocus, setDocumentHasFocusValue } from '@/test/document-helpers';

vi.mock('../safeLock', () => ({
  SafeLock: () => ({
    acquireLockAndRun: (cb: () => Promise<unknown>) => cb(),
  }),
}));

import { FOCUSED_POLLER_INTERVAL_IN_MS, POLLER_INTERVAL_IN_MS, SessionCookiePoller } from '../SessionCookiePoller';

describe('SessionCookiePoller', () => {
  let poller: SessionCookiePoller | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    poller?.stopPollingForSessionToken();
    poller = undefined;
    restoreDocument();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it.each([
    ['focused', () => setDocumentHasFocus(true), FOCUSED_POLLER_INTERVAL_IN_MS],
    ['unfocused', () => setDocumentHasFocus(false), POLLER_INTERVAL_IN_MS],
    ['non-callable document.hasFocus', () => setDocumentHasFocusValue(undefined), POLLER_INTERVAL_IN_MS],
    [
      'throwing document.hasFocus',
      () =>
        setDocumentHasFocusValue(() => {
          throw new Error('broken document');
        }),
      POLLER_INTERVAL_IN_MS,
    ],
    ['missing document', () => setDocument(undefined), POLLER_INTERVAL_IN_MS],
  ])('schedules the next tick at the expected interval when the tab is %s', async (_state, setup, expected) => {
    setup();
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    poller = new SessionCookiePoller();

    poller.startPollingForSessionToken(() => Promise.resolve());
    await Promise.resolve();
    await Promise.resolve();

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), expected);
  });
});
