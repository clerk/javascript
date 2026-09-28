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

  it('WEB3-07 surfaces connection errors on the provider and allows retry', async () => {
    const connect = vi
      .fn()
      .mockRejectedValueOnce(new Error('Wallet extension missing'))
      .mockResolvedValueOnce(undefined);
    const { result } = renderHook(() =>
      useUserProfileWeb3WalletsController({ wallets, availableProviders, connect, setPrimary: vi.fn() }),
    );

    await act(async () => result.current.onConnect('web3_metamask_signature'));
    expect(result.current.availableProviders[0].connectError).toBe('Wallet extension missing');
    await act(async () => result.current.onConnect('web3_metamask_signature'));
    expect(result.current.availableProviders[0].connectError).toBeUndefined();
  });

  it('WEB3-08 surfaces primary selection errors on the wallet', async () => {
    const { result } = renderHook(() =>
      useUserProfileWeb3WalletsController({
        wallets,
        availableProviders,
        connect: vi.fn(),
        setPrimary: vi.fn().mockRejectedValue(new Error('Reverification canceled')),
      }),
    );

    await act(async () => result.current.onSetPrimary('wallet_1'));
    expect(result.current.wallets[0].primaryError).toBe('Reverification canceled');
  });

  it('WEB3-09 opens the Solana picker before connecting', () => {
    const connect = vi.fn();
    const { result } = renderHook(() =>
      useUserProfileWeb3WalletsController({ wallets, availableProviders, connect, setPrimary: vi.fn() }),
    );
    act(() => void result.current.onConnect('web3_solana_signature'));
    expect(result.current.solanaPickerOpen).toBe(true);
    expect(connect).not.toHaveBeenCalled();
    act(() => result.current.closeSolanaPicker());
    expect(result.current.solanaPickerOpen).toBe(false);
  });
});
