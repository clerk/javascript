import { act, renderHook, waitFor } from '@testing-library/react';
import type { Wallet } from '@wallet-standard/core';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUserProfileSolanaWalletsModel } from './user-profile-solana-wallet.model';

const registry = vi.hoisted(() => {
  const wallets: Wallet[] = [];
  const listeners = { register: new Set<() => void>(), unregister: new Set<() => void>() };
  const getWallets = vi.fn(() => ({
    get: () => wallets,
    on: (event: 'register' | 'unregister', listener: () => void) => {
      listeners[event].add(listener);
      return () => listeners[event].delete(listener);
    },
  }));
  return { wallets, listeners, getWallets };
});

vi.mock('@wallet-standard/core', () => ({ getWallets: registry.getWallets }));

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

describe('useUserProfileSolanaWalletsModel', () => {
  beforeEach(() => {
    registry.wallets.splice(0);
    registry.listeners.register.clear();
    registry.listeners.unregister.clear();
    registry.getWallets.mockClear();
  });

  it('renders an empty server snapshot without initializing the browser registry', () => {
    registry.wallets.push(wallet('Phantom'));
    function WalletNames() {
      return createElement(
        'div',
        null,
        useUserProfileSolanaWalletsModel()
          .map(wallet => wallet.name)
          .join(','),
      );
    }

    expect(renderToString(createElement(WalletNames))).toBe('<div></div>');
    expect(registry.getWallets).not.toHaveBeenCalled();
  });

  it('starts empty and projects only eligible wallet names and icons after loading the registry', async () => {
    registry.wallets.push(wallet('Phantom'), wallet('Signer only', { 'solana:signMessage': {} }));
    const { result } = renderHook(useUserProfileSolanaWalletsModel);

    expect(result.current).toEqual([]);
    await waitFor(() => expect(result.current).toEqual([{ name: 'Phantom', icon: 'data:image/svg+xml;base64,' }]));
  });

  it.each([
    { chains: ['solana:mainnet'], features: { 'standard:connect': {}, 'solana:signMessage': {} }, eligible: true },
    { chains: ['solana:mainnet'], features: { 'solana:signMessage': {} }, eligible: false },
    { chains: ['solana:mainnet'], features: { 'standard:connect': {} }, eligible: false },
    { chains: ['eip155:1'], features: { 'standard:connect': {}, 'solana:signMessage': {} }, eligible: false },
    { chains: [], features: { 'standard:connect': {}, 'solana:signMessage': {} }, eligible: false },
  ] as const)('requires a Solana chain and both sign-in capabilities for $chains and $features', async entry => {
    registry.wallets.push(wallet('Candidate', entry.features, entry.chains));
    const { result } = renderHook(useUserProfileSolanaWalletsModel);
    await act(async () => {
      await vi.dynamicImportSettled();
    });
    expect(registry.getWallets).toHaveBeenCalled();
    expect(result.current).toEqual(entry.eligible ? [{ name: 'Candidate', icon: 'data:image/svg+xml;base64,' }] : []);
  });

  it('refreshes on registration and unregistration and removes both subscriptions on unmount', async () => {
    const { result, unmount } = renderHook(useUserProfileSolanaWalletsModel);
    await waitFor(() => expect(registry.listeners.register.size).toBe(1));

    act(() => {
      registry.wallets.push(wallet('Backpack'));
      registry.listeners.register.forEach(listener => listener());
    });
    expect(result.current).toEqual([{ name: 'Backpack', icon: 'data:image/svg+xml;base64,' }]);

    act(() => {
      registry.wallets.splice(0);
      registry.listeners.unregister.forEach(listener => listener());
    });
    expect(result.current).toEqual([]);

    unmount();
    expect(registry.listeners.register.size).toBe(0);
    expect(registry.listeners.unregister.size).toBe(0);
  });

  it('does not initialize or subscribe when unmounted before the module loads', async () => {
    const { unmount } = renderHook(useUserProfileSolanaWalletsModel);
    unmount();
    await act(async () => {
      await vi.dynamicImportSettled();
    });

    expect(registry.getWallets).not.toHaveBeenCalled();
    expect(registry.listeners.register.size).toBe(0);
    expect(registry.listeners.unregister.size).toBe(0);
  });
});
