import { __resetClerkQueryClientForTest } from '@clerk/shared/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup, configure } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, expect } from 'vitest';

import { startWorker, takeUnhandledRequests, takeUnsettledHolds, worker } from './src/__tests__/feature/fake-fapi';

expect.extend(matchers);

configure({ asyncUtilTimeout: 3000 });

const disableMotion = document.createElement('style');
disableMotion.textContent = `
  *, *::before, *::after {
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    animation-duration: 0s !important;
    animation-delay: 0s !important;
  }
  [data-starting-style] {
    opacity: 1 !important;
  }
`;
document.head.append(disableMotion);

const NativeBroadcastChannel = window.BroadcastChannel;
const channelNamespace = crypto.randomUUID();
const openChannels = new Set<IsolatedBroadcastChannel>();

class IsolatedBroadcastChannel extends NativeBroadcastChannel {
  private isClosed = false;

  constructor(name: string) {
    super(`${channelNamespace}:${name}`);
    openChannels.add(this);
  }

  override postMessage(message: unknown) {
    if (!this.isClosed) {
      super.postMessage(message);
    }
  }

  override close() {
    this.isClosed = true;
    openChannels.delete(this);
    super.close();
  }
}

beforeAll(async () => {
  window.BroadcastChannel = IsolatedBroadcastChannel;
  await startWorker();
});

beforeEach(() => {
  window.focus();
});

afterEach(() => {
  cleanup();
  __resetClerkQueryClientForTest();
  for (const channel of [...openChannels]) {
    channel.close();
  }
  for (const cookie of document.cookie.split('; ').filter(Boolean)) {
    document.cookie = `${cookie.split('=')[0]}=; max-age=0; path=/`;
  }
  localStorage.clear();
  sessionStorage.clear();
  worker.resetHandlers();
  const unhandled = takeUnhandledRequests();
  const unsettled = takeUnsettledHolds();
  expect(unhandled, 'Frontend API requests without a handler').toEqual([]);
  expect(unsettled, 'Held Frontend API requests never released or failed').toEqual([]);
});

afterAll(() => {
  window.BroadcastChannel = NativeBroadcastChannel;
  worker.stop();
});
