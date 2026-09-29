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
      useUserProfileWeb3WalletsController({
        wallets,
        availableProviders,
        connect,
        setPrimary: vi.fn(),
        fallbackErrorMessage: 'Something went wrong. Please try again.',
      }),
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

  it('uses the localized fallback when a wallet action rejects without a message', async () => {
    const { result } = renderHook(() =>
      useUserProfileWeb3WalletsController({
        wallets: [],
        availableProviders: [{ id: 'web3_metamask_signature', provider: 'MetaMask' }],
        connect: () => Promise.reject(new Error('')),
        setPrimary: () => Promise.resolve(),
        fallbackErrorMessage: 'Impossible de connecter le portefeuille.',
      }),
    );

    await act(async () => {
      await result.current.onConnect('web3_metamask_signature');
    });

    expect(result.current.availableProviders[0]?.connectError).toBe('Impossible de connecter le portefeuille.');
  });
});
