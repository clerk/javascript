import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useUserProfileEnterpriseAccountsController } from './user-profile-enterprise-accounts-section.controller';

const connections = [
  { id: 'okta', name: 'Acme Okta' },
  { id: 'saml', name: 'Custom SAML' },
];

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  let reject: (error: unknown) => void = () => undefined;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

const formatError = () => 'Something went wrong.';

afterEach(() => vi.useRealTimers());

describe('useUserProfileEnterpriseAccountsController', () => {
  it('synchronously suppresses duplicate and competing connects while keeping the selected row pending', async () => {
    const operation = deferred<'redirecting'>();
    const onConnect = vi.fn(() => operation.promise);
    const { result } = renderHook(() =>
      useUserProfileEnterpriseAccountsController({ accounts: [], connections, onConnect, formatError }),
    );

    act(() => {
      result.current.onConnect?.('okta');
      result.current.onConnect?.('okta');
      result.current.onConnect?.('saml');
    });
    expect(onConnect).toHaveBeenCalledExactlyOnceWith('okta');
    expect(result.current.pendingId).toBe('okta');

    await act(async () => {
      operation.resolve('redirecting');
      await operation.promise;
    });
    expect(result.current.pendingId).toBe('okta');
  });

  it('releases redirect pending after two seconds', async () => {
    vi.useFakeTimers();
    const onConnect = vi.fn().mockResolvedValue('redirecting');
    const { result } = renderHook(() =>
      useUserProfileEnterpriseAccountsController({ accounts: [], connections, onConnect, formatError }),
    );
    await act(async () => {
      result.current.onConnect?.('okta');
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.pendingId).toBe('okta');
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(result.current.pendingId).toBeUndefined();
  });

  it('shows a formatted error on the failed connection and clears it on retry', async () => {
    const onConnect = vi
      .fn()
      .mockRejectedValueOnce(new Error('raw'))
      .mockReturnValueOnce(new Promise(() => {}));
    const format = vi.fn(() => 'Formatted error.');
    const { result } = renderHook(() =>
      useUserProfileEnterpriseAccountsController({ accounts: [], connections, onConnect, formatError: format }),
    );

    act(() => result.current.onConnect('okta'));
    await waitFor(() => expect(result.current.connections[0].connectError).toBe('Formatted error.'));
    expect(format).toHaveBeenCalledWith(expect.objectContaining({ message: 'raw' }));
    expect(result.current.connections[1].connectError).toBeUndefined();

    act(() => result.current.onConnect('okta'));
    expect(result.current.connections[0].connectError).toBeUndefined();
  });
});
