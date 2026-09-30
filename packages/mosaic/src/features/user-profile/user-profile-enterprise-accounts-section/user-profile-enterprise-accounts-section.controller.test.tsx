import { act, renderHook } from '@testing-library/react';
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

afterEach(() => vi.useRealTimers());

describe('useUserProfileEnterpriseAccountsController', () => {
  it('synchronously suppresses duplicate and competing connects while keeping the selected row pending', async () => {
    const operation = deferred<'redirecting'>();
    const onConnect = vi.fn(() => operation.promise);
    const { result } = renderHook(() =>
      useUserProfileEnterpriseAccountsController({ status: 'ready', accounts: [], connections, onConnect }),
    );

    act(() => {
      result.current.onConnect?.('okta');
      result.current.onConnect?.('okta');
      result.current.onConnect?.('saml');
    });
    expect(onConnect).toHaveBeenCalledExactlyOnceWith('okta');
    expect(result.current.pendingConnectionId).toBe('okta');

    await act(async () => {
      operation.resolve('redirecting');
      await operation.promise;
    });
    expect(result.current.pendingConnectionId).toBe('okta');
  });

  it('releases redirect pending after two seconds', async () => {
    vi.useFakeTimers();
    const onConnect = vi.fn().mockResolvedValue('redirecting');
    const { result } = renderHook(() =>
      useUserProfileEnterpriseAccountsController({ status: 'ready', accounts: [], connections, onConnect }),
    );
    await act(async () => {
      result.current.onConnect?.('okta');
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.pendingConnectionId).toBe('okta');
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.pendingConnectionId).toBeUndefined();
  });
});
