import { createDeferredPromise } from '@clerk/shared/utils';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useUserProfileWeb3WalletsController } from './user-profile-web3-wallets-section.controller';

const wallets = [{ id: 'wallet_1', address: '0x1234567890abcdef', isVerified: true }];
const availableProviders = [{ id: 'web3_metamask_signature', provider: 'MetaMask' }];

describe('Web3 wallet controller', () => {
  it('WEB3-06 holds a pending connection and blocks another attempt', async () => {
    const pending = createDeferredPromise();
    const connect = vi.fn(() => pending.promise);
    const { result } = renderHook(() =>
      useUserProfileWeb3WalletsController({ wallets, availableProviders, connect, setPrimary: vi.fn() }),
    );

    act(() => {
      void result.current.onConnect('web3_metamask_signature');
      void result.current.onConnect('web3_metamask_signature');
      void result.current.onConnect('web3_solana_signature');
    });
    expect(result.current.pendingId).toBe('web3_metamask_signature');
    expect(connect).toHaveBeenCalledOnce();
    expect(result.current.solanaPickerOpen).toBe(false);

    await act(async () => {
      pending.resolve();
      await pending.promise;
    });
    await waitFor(() => expect(result.current.pendingId).toBeUndefined());
  });
});
