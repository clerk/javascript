import { cleanup } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { serveFapi } from './fake-fapi';
import { fapiClient, fapiSession, fapiUser } from './fapi';
import { cleanupClerkInstances, renderWithClerk } from './render';

describe('feature render lifecycle', () => {
  it('releases Clerk workers after each feature cleanup', async () => {
    const NativeWorker = window.Worker;
    const activeWorkers = new Set<Worker>();
    class TrackedWorker extends NativeWorker {
      constructor(...args: ConstructorParameters<typeof Worker>) {
        super(...args);
        activeWorkers.add(this);
      }
      override terminate() {
        super.terminate();
        activeWorkers.delete(this);
      }
    }
    window.Worker = TrackedWorker;
    try {
      const user = fapiUser({ id: 'user_1' });
      serveFapi({ client: fapiClient([fapiSession({ id: 'sess_1', user })]) });
      for (let i = 0; i < 3; i += 1) {
        await renderWithClerk(<div />);
        expect(activeWorkers.size).toBeGreaterThan(0);
        cleanup();
        cleanupClerkInstances();
        cleanupClerkInstances();
        expect(activeWorkers.size).toBe(0);
      }
    } finally {
      cleanup();
      cleanupClerkInstances();
      for (const worker of activeWorkers) {
        worker.terminate();
      }
      window.Worker = NativeWorker;
    }
  });

  it('keeps previous sessions inactive while the next Clerk loads and handles page focus', async () => {
    const firstUser = fapiUser({ id: 'user_first' });
    serveFapi({ client: fapiClient([fapiSession({ id: 'sess_first', user: firstUser })]) });
    const { clerk: first } = await renderWithClerk(<div />);
    const firstSession = first.session;
    if (firstSession == null) {
      throw new Error('Expected the first Clerk to have a session');
    }
    const previousGetToken = vi.spyOn(firstSession, 'getToken');
    try {
      cleanup();
      cleanupClerkInstances();
      previousGetToken.mockClear();
      const nextUser = fapiUser({ id: 'user_next' });
      serveFapi({ client: fapiClient([fapiSession({ id: 'sess_next', user: nextUser })]) });
      const { clerk: next } = await renderWithClerk(<div />);
      expect(previousGetToken).not.toHaveBeenCalled();
      const nextSession = next.session;
      if (nextSession == null) {
        throw new Error('Expected the next Clerk to have a session');
      }
      const currentGetToken = vi.spyOn(nextSession, 'getToken');
      try {
        expect(document.visibilityState).toBe('visible');
        window.dispatchEvent(new Event('focus'));
        document.dispatchEvent(new Event('visibilitychange'));
        expect(previousGetToken).not.toHaveBeenCalled();
        expect(currentGetToken).toHaveBeenCalled();
      } finally {
        currentGetToken.mockRestore();
      }
    } finally {
      previousGetToken.mockRestore();
      cleanup();
      cleanupClerkInstances();
    }
  });
});
