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
      formatError: () => 'Something went wrong.',
    }),
  );

  act(() => result.current.onConnect('github'));
  expect(result.current.pendingId).toBe('github');

  await waitFor(() => expect(result.current.pendingId).toBeUndefined(), { timeout: 2500 });
  act(() => result.current.onConnect('google'));
  expect(onConnect).toHaveBeenCalledTimes(2);
});

it('ignores another action while one is pending', async () => {
  let release: () => void = () => {};
  const onConnect = vi.fn(() => new Promise<void>(resolve => (release = resolve)));
  const onReconnect = vi.fn(() => Promise.resolve());
  const { result } = renderHook(() =>
    useUserProfileConnectedAccountsController({
      accounts: [{ id: 'idn_github', provider: 'GitHub' }],
      availableProviders: [{ id: 'oauth_google', provider: 'Google' }],
      onConnect,
      onReconnect,
      formatError: () => 'Something went wrong.',
    }),
  );

  act(() => result.current.onConnect('oauth_google'));
  act(() => result.current.onConnect('oauth_google'));
  act(() => result.current.onReconnect('idn_github'));
  expect(onConnect).toHaveBeenCalledTimes(1);
  expect(onReconnect).not.toHaveBeenCalled();

  act(() => release());
  await waitFor(() => expect(result.current.pendingId).toBeUndefined());
});

it('shows a formatted error on the failed row and clears it on retry', async () => {
  const onConnect = vi
    .fn()
    .mockRejectedValueOnce(new Error('raw'))
    .mockReturnValueOnce(new Promise(() => {}));
  const formatError = vi.fn(() => 'Formatted error.');
  const { result } = renderHook(() =>
    useUserProfileConnectedAccountsController({
      accounts: [],
      availableProviders: [
        { id: 'oauth_google', provider: 'Google' },
        { id: 'oauth_github', provider: 'GitHub' },
      ],
      onConnect,
      onReconnect: vi.fn(),
      formatError,
    }),
  );

  act(() => result.current.onConnect('oauth_google'));
  await waitFor(() => expect(result.current.availableProviders[0].connectError).toBe('Formatted error.'));
  expect(formatError).toHaveBeenCalledWith(expect.objectContaining({ message: 'raw' }));
  expect(result.current.availableProviders[1].connectError).toBeUndefined();

  act(() => result.current.onConnect('oauth_google'));
  expect(result.current.availableProviders[0].connectError).toBeUndefined();
});
