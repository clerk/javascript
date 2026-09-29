import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { useUserProfileConnectedAccountsController } from './user-profile-connected-accounts-section.controller';

it('releases pending actions when a redirect leaves the page mounted', async () => {
  const onConnect = vi.fn().mockResolvedValue('redirecting');
  const { result } = renderHook(() =>
    useUserProfileConnectedAccountsController({
      accounts: [],
      availableProviders: [],
      onConnect,
      onReconnect: onConnect,
      fallbackErrorMessage: 'Something went wrong.',
    }),
  );

  act(() => result.current.onConnect('github'));
  expect(result.current.pendingId).toBe('github');

  await waitFor(() => expect(result.current.pendingId).toBeUndefined(), { timeout: 2500 });
  act(() => result.current.onConnect('google'));
  expect(onConnect).toHaveBeenCalledTimes(2);
});
