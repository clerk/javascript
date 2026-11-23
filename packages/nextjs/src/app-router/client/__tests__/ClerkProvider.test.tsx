import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { invalidateCacheAction, refresh } = vi.hoisted(() => ({ invalidateCacheAction: vi.fn(), refresh: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh, push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
}));

vi.mock('@clerk/clerk-react', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../server-actions', () => ({ invalidateCacheAction }));

vi.mock('../../keyless-actions', () => ({ detectKeylessEnvDriftAction: vi.fn() }));

vi.mock('../../../utils/clerk-js-script', () => ({ ClerkJSScript: () => null }));

vi.mock('../../../utils/router-telemetry', () => ({ RouterTelemetry: () => null }));

vi.mock('../../../utils/feature-flags', () => ({ canUseKeyless: false }));

import { ClientClerkProvider } from '../ClerkProvider';

describe('ClientClerkProvider __unstable__onBeforeSetActive', () => {
  beforeEach(() => {
    invalidateCacheAction.mockReset();
    refresh.mockReset();
    render(
      <ClientClerkProvider publishableKey='pk_test_Y2xlcmsuZXhhbXBsZS5jb20k'>
        <div />
      </ClientClerkProvider>,
    );
  });

  afterEach(() => {
    cleanup();
    delete (window as { next?: unknown }).next;
  });

  it('waits for the cache invalidation before it resolves', async () => {
    let finishInvalidation!: () => void;
    invalidateCacheAction.mockReturnValue(new Promise<void>(resolve => (finishInvalidation = resolve)));

    let settled = false;
    const hook = Promise.resolve(window.__unstable__onBeforeSetActive()).then(() => (settled = true));
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(settled).toBe(false);

    finishInvalidation();
    await hook;
    expect(settled).toBe(true);
  });

  it.each(['15.5.9', '16.2.6'])('skips the cache invalidation on sign-out with Next.js %s', async version => {
    (window as { next?: unknown }).next = { version };

    await expect(window.__unstable__onBeforeSetActive('sign-out')).resolves.toBeUndefined();
    expect(invalidateCacheAction).not.toHaveBeenCalled();
  });

  it('resolves when the cache invalidation action rejects', async () => {
    invalidateCacheAction.mockRejectedValue(new Error('Server Action was not found on the server'));

    const outcome = await Promise.race([
      Promise.resolve(window.__unstable__onBeforeSetActive()).then(() => 'settled'),
      new Promise(resolve => setTimeout(() => resolve('hung'), 100)),
    ]);

    expect(outcome).toBe('settled');
    expect(refresh).not.toHaveBeenCalled();
  });

  it('does not leave an unhandled rejection when the cache invalidation action rejects', async () => {
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => unhandled.push(reason);
    process.on('unhandledRejection', onUnhandled);
    invalidateCacheAction.mockRejectedValue(new Error('Server Action was not found on the server'));

    await window.__unstable__onBeforeSetActive();
    await new Promise(resolve => setTimeout(resolve, 10));
    process.off('unhandledRejection', onUnhandled);

    expect(unhandled).toEqual([]);
  });
});
