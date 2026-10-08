import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Wallet } from '@wallet-standard/core';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../../mosaic-provider';
import { UserProfileWeb3WalletsSection } from '../user-profile-web3-wallets-section';
import type { ReadyWeb3WalletsModel } from '../user-profile-web3-wallets-section.types';

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
  return { wallets, listeners, getWallets, loadModule: vi.fn() };
});

vi.mock('@wallet-standard/core', () => {
  registry.loadModule();
  return { getWallets: registry.getWallets };
});
vi.mock('../user-profile-web3-wallets-section.model', () => ({
  useUserProfileWeb3WalletsModel: () =>
    ({
      status: 'ready',
      userId: 'user_1',
      wallets: [],
      availableProviders: [{ id: 'web3_solana_signature', provider: 'Solana', walletPicker: 'solana' }],
      connect: async () => {},
      setPrimary: async () => {},
    }) satisfies ReadyWeb3WalletsModel,
}));

function wallet(name: string): Wallet {
  return {
    name,
    icon: 'data:image/svg+xml;base64,',
    version: '1.0.0',
    chains: ['solana:mainnet'],
    accounts: [],
    features: { 'standard:connect': {}, 'solana:signMessage': {} },
  };
}

describe('Solana picker discovery lifetime', () => {
  it('discovers wallets only while the picker content is mounted and refreshes after reopening', async () => {
    registry.wallets.push(wallet('Phantom'));
    const user = userEvent.setup();
    const { unmount } = render(
      <MosaicProvider>
        <UserProfileWeb3WalletsSection />
      </MosaicProvider>,
    );

    await act(async () => {
      await vi.dynamicImportSettled();
    });
    expect(registry.loadModule).not.toHaveBeenCalled();
    expect(registry.getWallets).not.toHaveBeenCalled();
    expect(registry.listeners.register.size).toBe(0);
    expect(registry.listeners.unregister.size).toBe(0);

    await user.click(screen.getByRole('button', { name: 'Connect Solana' }));
    expect(await screen.findByRole('button', { name: 'Phantom' })).toBeInTheDocument();
    expect(registry.loadModule).toHaveBeenCalledOnce();
    expect(registry.getWallets).toHaveBeenCalledOnce();
    expect(registry.listeners.register.size).toBe(1);
    expect(registry.listeners.unregister.size).toBe(1);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(registry.listeners.register.size).toBe(0);
    expect(registry.listeners.unregister.size).toBe(0);

    registry.wallets.splice(0, registry.wallets.length, wallet('Backpack'));
    await user.click(screen.getByRole('button', { name: 'Connect Solana' }));
    expect(await screen.findByRole('button', { name: 'Backpack' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Phantom' })).not.toBeInTheDocument();
    expect(registry.getWallets).toHaveBeenCalledTimes(2);

    unmount();
    expect(registry.listeners.register.size).toBe(0);
    expect(registry.listeners.unregister.size).toBe(0);
  });
});
