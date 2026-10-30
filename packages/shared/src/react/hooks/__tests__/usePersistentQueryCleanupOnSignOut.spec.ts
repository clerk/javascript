import { renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import type { Clerk, Resources } from '@/types';

import { __createClerkTestQueryClient, __resetClerkQueryClientForTest } from '../../query/clerk-query-client';
import { usePersistentQueryCleanupOnSignOut } from '../useClearQueriesOnSignOut';

const { useClerkInstanceContext } = vi.hoisted(() => ({
  useClerkInstanceContext: vi.fn<() => Pick<Clerk, 'addListener' | 'user'>>(),
}));

vi.mock('../../contexts', () => ({ useClerkInstanceContext }));

afterEach(() => {
  __resetClerkQueryClientForTest();
  vi.clearAllMocks();
});

it('keeps one sign-out subscription after StrictMode setup and unmount', () => {
  const client = __createClerkTestQueryClient();
  const unsubscribe = vi.fn();
  const clerk = {
    user: undefined,
    addListener: vi.fn<Clerk['addListener']>(() => unsubscribe),
  };
  useClerkInstanceContext.mockReturnValue(clerk);
  client.setQueryData(['sessions', true], 'private');

  const { unmount } = renderHook(() => usePersistentQueryCleanupOnSignOut('sessions'), { wrapper: StrictMode });
  unmount();

  expect(clerk.addListener).toHaveBeenCalledTimes(1);
  expect(unsubscribe).not.toHaveBeenCalled();
  const callback = clerk.addListener.mock.calls[0]?.[0];
  callback?.({
    user: null,
    get client(): Resources['client'] {
      throw new Error('Sign-out cleanup must not read the client resource');
    },
  });
  expect(client.getQueryState(['sessions', true])).toBeUndefined();
});
