import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CrossTabSessionSyncOptions } from '../CrossTabSessionSync';

const crossTabStartMock = vi.fn();
const crossTabStopMock = vi.fn();
const pollerStartMock = vi.fn();
const pollerStopMock = vi.fn();
let capturedCrossTabOptions: CrossTabSessionSyncOptions | null = null;

vi.mock('../CrossTabSessionSync', () => {
  return {
    CrossTabSessionSync: vi.fn().mockImplementation((options: CrossTabSessionSyncOptions) => {
      capturedCrossTabOptions = options;
      return {
        clearSession: vi.fn(),
        notifyRefreshComplete: vi.fn(),
        start: crossTabStartMock,
        stop: crossTabStopMock,
        updateSession: vi.fn(),
      };
    }),
  };
});

vi.mock('../SessionCookiePoller', () => {
  return {
    SessionCookiePoller: vi.fn().mockImplementation(() => ({
      startPollingForSessionToken: pollerStartMock,
      stopPollingForSessionToken: pollerStopMock,
    })),
  };
});

// eslint-disable-next-line import/first
import { SessionRefreshCoordinator } from '../SessionRefreshCoordinator';

describe('SessionRefreshCoordinator', () => {
  beforeEach(() => {
    crossTabStartMock.mockReset();
    crossTabStopMock.mockReset();
    pollerStartMock.mockReset();
    pollerStopMock.mockReset();
    capturedCrossTabOptions = null;
    crossTabStartMock.mockReturnValue(true);

    // Minimal browser globals required by the coordinator.
    // @ts-ignore
    globalThis.window = {
      addEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      removeEventListener: vi.fn(),
    };
    // @ts-ignore
    globalThis.CustomEvent = class CustomEvent {
      detail: unknown;
      constructor(_type: string, init?: CustomEventInit) {
        this.detail = init?.detail;
      }
    };
    // @ts-ignore
    globalThis.Worker = class {};
    // @ts-ignore
    globalThis.BroadcastChannel = class {
      addEventListener = vi.fn();
      close = vi.fn();
      postMessage = vi.fn();
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    delete globalThis.window;
    // @ts-ignore
    delete globalThis.CustomEvent;
    // @ts-ignore
    delete globalThis.Worker;
    // @ts-ignore
    delete globalThis.BroadcastChannel;
  });

  it('uses polling when event-driven mode is disabled', () => {
    const coordinator = new SessionRefreshCoordinator();
    const refresh = vi.fn().mockResolvedValue(undefined);

    coordinator.startPollingForSessionToken(refresh, { enableEventDrivenSync: false });

    expect(pollerStartMock).toHaveBeenCalledWith(refresh);
    expect(crossTabStartMock).not.toHaveBeenCalled();
  });

  it('prefers event-driven mode when supported', () => {
    const coordinator = new SessionRefreshCoordinator();
    const refresh = vi.fn().mockResolvedValue(undefined);

    coordinator.startPollingForSessionToken(refresh, { enableEventDrivenSync: true });

    expect(coordinator.isEventDriven()).toBe(true);
    expect(crossTabStartMock).toHaveBeenCalledTimes(1);
    expect(pollerStartMock).not.toHaveBeenCalled();
  });

  it('falls back to polling when cross-tab sync fails to start', () => {
    const coordinator = new SessionRefreshCoordinator();
    const refresh = vi.fn().mockResolvedValue(undefined);
    crossTabStartMock.mockReturnValue(false);

    coordinator.startPollingForSessionToken(refresh, { enableEventDrivenSync: true });

    expect(pollerStartMock).toHaveBeenCalledWith(refresh);
    expect(coordinator.isEventDriven()).toBe(false);
  });

  it('switches to polling when cross-tab sync reports a fatal error', () => {
    const coordinator = new SessionRefreshCoordinator();
    const refresh = vi.fn().mockResolvedValue(undefined);

    coordinator.startPollingForSessionToken(refresh, { enableEventDrivenSync: true });
    expect(coordinator.isEventDriven()).toBe(true);
    capturedCrossTabOptions?.onFatalError?.('worker_error');

    expect(coordinator.isEventDriven()).toBe(false);
    expect(pollerStartMock).toHaveBeenCalledWith(refresh);
  });
});
