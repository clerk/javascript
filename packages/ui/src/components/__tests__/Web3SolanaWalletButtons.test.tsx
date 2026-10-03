import type { Wallet, WindowAppReadyEventAPI } from '@wallet-standard/core';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bindCreateFixtures } from '@/test/create-fixtures';
import { render, screen } from '@/test/utils';
import { withCardStateProvider } from '@/ui/elements/contexts';

import { Web3SolanaWalletButtons } from '../Web3SolanaWalletButtons';

let installedWallets: Wallet[] = [];
const unregister: Array<() => void> = [];

function register(api: WindowAppReadyEventAPI) {
  unregister.push(api.register(...installedWallets));
}

function onAppReady(event: Event & { detail?: WindowAppReadyEventAPI }) {
  if (event.detail) {
    register(event.detail);
  }
}

function installWallets(wallets: Wallet[]) {
  installedWallets = wallets;
  window.dispatchEvent(new CustomEvent('wallet-standard:register-wallet', { detail: register }));
}

const makeWallet = (name: string, chains: Wallet['chains'], features: string[]): Wallet => ({
  name,
  icon: 'data:image/svg+xml;base64,',
  version: '1.0.0',
  chains,
  accounts: [],
  features: Object.fromEntries(features.map(feature => [feature, {}])),
});

const SIGN_IN_FEATURES = ['standard:connect', 'solana:signMessage'];

const { createFixtures } = bindCreateFixtures('SignIn');

const Buttons = withCardStateProvider(Web3SolanaWalletButtons);

describe('Web3SolanaWalletButtons', () => {
  beforeEach(() => {
    installedWallets = [];
    window.addEventListener('wallet-standard:app-ready', onAppReady);
  });

  afterEach(() => {
    window.removeEventListener('wallet-standard:app-ready', onAppReady);
    unregister.splice(0).forEach(off => off());
  });

  it('lists only Solana wallets that can connect and sign messages', async () => {
    installWallets([
      makeWallet('Phantom', ['solana:mainnet'], SIGN_IN_FEATURES),
      makeWallet('Solana Viewer', ['solana:mainnet'], ['standard:connect']),
      makeWallet('Solana Signer', ['solana:mainnet'], ['solana:signMessage']),
      makeWallet('MetaMask', ['eip155:1'], SIGN_IN_FEATURES),
    ]);
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
      installWallets([makeWallet('Backpack', ['solana:mainnet'], SIGN_IN_FEATURES)]);
    });

    expect(await screen.findByText('Continue with Backpack')).toBeInTheDocument();

    act(() => {
      installedWallets = [];
      unregister.splice(0).forEach(off => off());
    });
    expect(await screen.findByText(/No Solana Web3 wallets detected/)).toBeInTheDocument();
  });

  it('passes the chosen wallet name to the auth callback', async () => {
    installWallets([makeWallet('Phantom', ['solana:mainnet'], SIGN_IN_FEATURES)]);
    const web3AuthCallback = vi.fn().mockResolvedValue(undefined);
    const { wrapper } = await createFixtures();

    const { userEvent } = render(<Buttons web3AuthCallback={web3AuthCallback} />, { wrapper });

    await userEvent.click(await screen.findByText('Continue with Phantom'));

    expect(web3AuthCallback).toHaveBeenCalledWith({ walletName: 'Phantom' });
  });
});
