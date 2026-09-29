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
        setPrimary: vi.fn().mockRejectedValue(new Error('Primary update failed')),
      }),
    );

    await act(async () => result.current.onSetPrimary('wallet_1'));
    expect(result.current.wallets[0].primaryError).toBe('Primary update failed');
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

it.each(['connect', 'primary', 'solana'] as const)('shows a rejected %s request and allows retry', async action => {
  const request = vi.fn().mockRejectedValueOnce(new Error('Wallet request failed')).mockResolvedValueOnce(undefined);
  const { result } = renderHook(() =>
    useUserProfileWeb3WalletsController({
      wallets,
      availableProviders: [...availableProviders, { id: 'web3_solana_signature', provider: 'Solana' }],
      connect: request,
      setPrimary: request,
    }),
  );
  const run = () =>
    action === 'primary'
      ? result.current.onSetPrimary('wallet_1')
      : action === 'solana'
        ? result.current.connectSolana('Phantom')
        : result.current.onConnect('web3_metamask_signature');
  if (action === 'solana') {
    act(() => void result.current.onConnect('web3_solana_signature'));
  }
  await act(async () => {
    await run();
  });
  expect(result.current.pendingId).toBeUndefined();
  if (action === 'primary') {
    expect(result.current.wallets[0].primaryError).toBe('Wallet request failed');
  } else {
    const provider = result.current.availableProviders.find(
      item => item.id === (action === 'solana' ? 'web3_solana_signature' : 'web3_metamask_signature'),
    );
    expect(provider?.connectError).toBe('Wallet request failed');
  }
  if (action === 'solana') {
    expect(result.current.solanaPickerOpen).toBe(true);
  }
  await act(async () => {
    await run();
  });
  expect(request).toHaveBeenCalledTimes(2);
  expect(result.current.wallets[0].primaryError).toBeUndefined();
  expect(result.current.availableProviders.every(provider => provider.connectError === undefined)).toBe(true);
});
