import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { invalidateCacheAction, refresh } = vi.hoisted(() => ({ invalidateCacheAction: vi.fn(), refresh: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh, push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
}));

vi.mock('@clerk/react/internal', () => ({
  InternalClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../server-actions', () => ({ invalidateCacheAction }));

vi.mock('../ClerkScripts', () => ({ ClerkScripts: () => null }));

vi.mock('../../../utils/router-telemetry', () => ({ RouterTelemetry: () => null }));

vi.mock('../../../utils/feature-flags', () => ({ canUseKeyless: false }));

import { ClientClerkProvider } from '../ClerkProvider';

describe('ClientClerkProvider __internal_onBeforeSetActive', () => {
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
  });

  it('resolves after the cache is invalidated', async () => {
    invalidateCacheAction.mockResolvedValue(undefined);

    await expect(window.__internal_onBeforeSetActive()).resolves.toBeUndefined();
    expect(invalidateCacheAction).toHaveBeenCalledTimes(1);
    expect(refresh).not.toHaveBeenCalled();
  });

  it('resolves when the cache invalidation action rejects', async () => {
    invalidateCacheAction.mockRejectedValue(new Error('Server Action was not found on the server'));

    const outcome = await Promise.race([
      Promise.resolve(window.__internal_onBeforeSetActive()).then(() => 'settled'),
      new Promise(resolve => setTimeout(() => resolve('hung'), 100)),
    ]);

    expect(outcome).toBe('settled');
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
