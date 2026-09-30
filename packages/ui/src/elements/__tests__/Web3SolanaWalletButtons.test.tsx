import type { Wallet } from '@wallet-standard/core';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';

import { withCardStateProvider } from '../contexts';
import { Web3SolanaWalletButtons } from '../Web3SolanaWalletButtons';

const registry = vi.hoisted(() => ({
  wallets: [] as Wallet[],
  listeners: { register: new Set<() => void>(), unregister: new Set<() => void>() },
}));

vi.mock('@wallet-standard/core', () => ({
  getWallets: () => ({
    get: () => registry.wallets,
    on: (event: 'register' | 'unregister', listener: () => void) => {
      registry.listeners[event].add(listener);
      return () => registry.listeners[event].delete(listener);
    },
  }),
}));

const makeWallet = (name: string, chains: string[], features: string[]): Wallet =>
  ({
    name,
    icon: 'data:image/svg+xml;base64,',
    version: '1.0.0',
    chains,
    accounts: [],
    features: Object.fromEntries(features.map(feature => [feature, {}])),
  }) as unknown as Wallet;

const SIGN_IN_FEATURES = ['standard:connect', 'solana:signMessage'];

const { createFixtures } = bindCreateFixtures('SignIn');

const Buttons = withCardStateProvider(Web3SolanaWalletButtons);

describe('Web3SolanaWalletButtons', () => {
  beforeEach(() => {
    registry.wallets = [];
    registry.listeners.register.clear();
    registry.listeners.unregister.clear();
  });

  it('lists only Solana wallets that can connect and sign messages', async () => {
    registry.wallets = [
      makeWallet('Phantom', ['solana:mainnet'], SIGN_IN_FEATURES),
      makeWallet('Solana Viewer', ['solana:mainnet'], ['standard:connect']),
      makeWallet('Solana Signer', ['solana:mainnet'], ['solana:signMessage']),
      makeWallet('MetaMask', ['eip155:1'], SIGN_IN_FEATURES),
    ];
    const { wrapper } = await createFixtures();

    render(<Buttons web3AuthCallback={vi.fn()} />, { wrapper });

    expect(await screen.findByText('Continue with Phantom')).toBeInTheDocument();
    expect(screen.queryByText(/Solana Viewer/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Solana Signer/)).not.toBeInTheDocument();
    expect(screen.queryByText(/MetaMask/)).not.toBeInTheDocument();
  });

  it('shows the none-available message, then picks up a wallet that registers later', async () => {
    const { wrapper } = await createFixtures();

    render(<Buttons web3AuthCallback={vi.fn()} />, { wrapper });

    expect(await screen.findByText(/No Solana Web3 wallets detected/)).toBeInTheDocument();

    act(() => {
      registry.wallets = [makeWallet('Backpack', ['solana:mainnet'], SIGN_IN_FEATURES)];
      registry.listeners.register.forEach(listener => listener());
    });

    expect(await screen.findByText('Continue with Backpack')).toBeInTheDocument();
  });

  it('passes the chosen wallet name to the auth callback', async () => {
    registry.wallets = [makeWallet('Phantom', ['solana:mainnet'], SIGN_IN_FEATURES)];
    const web3AuthCallback = vi.fn().mockResolvedValue(undefined);
    const { wrapper } = await createFixtures();

    const { userEvent } = render(<Buttons web3AuthCallback={web3AuthCallback} />, { wrapper });

    await userEvent.click(await screen.findByText('Continue with Phantom'));

    expect(web3AuthCallback).toHaveBeenCalledWith({ walletName: 'Phantom' });
  });
});
