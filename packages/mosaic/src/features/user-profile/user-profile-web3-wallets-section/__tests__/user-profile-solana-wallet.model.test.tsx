import { act, renderHook, waitFor } from '@testing-library/react';
import type { Wallet } from '@wallet-standard/core';
import { getWallets } from '@wallet-standard/core';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useUserProfileSolanaWalletsModel } from '../user-profile-solana-wallet.model';

vi.mock('@wallet-standard/core', async importOriginal => {
  const actual = await importOriginal<typeof import('@wallet-standard/core')>();
  return { ...actual, getWallets: vi.fn(actual.getWallets) };
});

const unregisters: Array<() => void> = [];

function register(...wallets: Wallet[]) {
  const unregister = getWallets().register(...wallets);
  unregisters.push(unregister);
  return unregister;
}

function wallet(
  name: string,
  features: Wallet['features'] = { 'standard:connect': {}, 'solana:signMessage': {} },
  chains: Wallet['chains'] = ['solana:mainnet'],
): Wallet {
  return {
    name,
    icon: 'data:image/svg+xml;base64,',
    version: '1.0.0',
    chains,
    accounts: [],
    features,
  };
}

function watchedWallet(name: string) {
  let reads = 0;
  const watched: Wallet = {
    ...wallet(name),
    get chains(): Wallet['chains'] {
      reads += 1;
      return ['solana:mainnet'];
    },
  };
  return { wallet: watched, reads: () => reads };
}

describe('useUserProfileSolanaWalletsModel', () => {
  afterEach(() => {
    unregisters.splice(0).forEach(unregister => unregister());
    vi.mocked(getWallets).mockClear();
  });

  it('renders a loading server snapshot without touching the registry', () => {
    function WalletNames() {
      return createElement('div', null, useUserProfileSolanaWalletsModel().status);
    }

    expect(renderToString(createElement(WalletNames))).toBe('<div>loading</div>');
    expect(getWallets).not.toHaveBeenCalled();
  });

  it('starts loading and projects only eligible wallet names and icons after loading the registry', async () => {
    register(wallet('Phantom'), wallet('Signer only', { 'solana:signMessage': {} }));
    const { result } = renderHook(useUserProfileSolanaWalletsModel);

    expect(result.current).toEqual({ status: 'loading' });
    await waitFor(() =>
      expect(result.current).toEqual({
        status: 'ready',
        wallets: [{ name: 'Phantom', icon: 'data:image/svg+xml;base64,' }],
      }),
    );
  });

  it.each([
    { chains: ['solana:mainnet'], features: { 'standard:connect': {}, 'solana:signMessage': {} }, eligible: true },
    { chains: ['solana:mainnet'], features: { 'solana:signMessage': {} }, eligible: false },
    { chains: ['solana:mainnet'], features: { 'standard:connect': {} }, eligible: false },
    { chains: ['eip155:1'], features: { 'standard:connect': {}, 'solana:signMessage': {} }, eligible: false },
    { chains: [], features: { 'standard:connect': {}, 'solana:signMessage': {} }, eligible: false },
  ] as const)('requires a Solana chain and both sign-in capabilities for $chains and $features', async entry => {
    register(wallet('Candidate', entry.features, entry.chains));
    const { result } = renderHook(useUserProfileSolanaWalletsModel);
    await act(async () => {
      await vi.dynamicImportSettled();
    });
    expect(result.current).toEqual({
      status: 'ready',
      wallets: entry.eligible ? [{ name: 'Candidate', icon: 'data:image/svg+xml;base64,' }] : [],
    });
  });

  it('refreshes on registration and unregistration and stops listening on unmount', async () => {
    const { result, unmount } = renderHook(useUserProfileSolanaWalletsModel);
    await waitFor(() => expect(result.current).toEqual({ status: 'ready', wallets: [] }));

    let unregisterBackpack = () => {};
    act(() => {
      unregisterBackpack = register(wallet('Backpack'));
    });
    expect(result.current).toEqual({
      status: 'ready',
      wallets: [{ name: 'Backpack', icon: 'data:image/svg+xml;base64,' }],
    });

    act(() => unregisterBackpack());
    expect(result.current).toEqual({ status: 'ready', wallets: [] });

    const watched = watchedWallet('Watched');
    let unregisterOther = () => {};
    act(() => {
      register(watched.wallet);
      unregisterOther = register(wallet('Other'));
    });
    unmount();
    const readsAtUnmount = watched.reads();

    unregisterOther();
    register(wallet('Late'));
    expect(watched.reads()).toBe(readsAtUnmount);
  });

  it('does not touch the registry when unmounted before the module loads', async () => {
    const { unmount } = renderHook(useUserProfileSolanaWalletsModel);
    unmount();
    await act(async () => {
      await vi.dynamicImportSettled();
    });

    expect(getWallets).not.toHaveBeenCalled();
    const watched = watchedWallet('Late');
    register(watched.wallet);
    expect(watched.reads()).toBe(0);
  });
});
