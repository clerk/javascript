import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../safeLock', () => ({
  SafeLock: () => ({
    acquireLockAndRun: (cb: () => Promise<unknown>) => cb(),
  }),
}));

import { FOCUSED_POLLER_INTERVAL_IN_MS, POLLER_INTERVAL_IN_MS, SessionCookiePoller } from '../SessionCookiePoller';

const originalDocument = globalThis.document;
const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
const originalHasFocusDescriptor = Object.getOwnPropertyDescriptor(originalDocument, 'hasFocus');

const setDocumentHasFocus = (value: boolean) => {
  Object.defineProperty(globalThis.document, 'hasFocus', { configurable: true, value: () => value });
};

const setDocumentHasFocusValue = (value: unknown) => {
  Object.defineProperty(globalThis.document, 'hasFocus', { configurable: true, value });
};

const setDocument = (value: unknown) => {
  Object.defineProperty(globalThis, 'document', { configurable: true, value });
};

const restoreDocument = () => {
  if (originalDocumentDescriptor) {
    Object.defineProperty(globalThis, 'document', originalDocumentDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, 'document');
  }

  if (originalHasFocusDescriptor) {
    Object.defineProperty(originalDocument, 'hasFocus', originalHasFocusDescriptor);
  } else {
    Reflect.deleteProperty(originalDocument, 'hasFocus');
  }
};

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
