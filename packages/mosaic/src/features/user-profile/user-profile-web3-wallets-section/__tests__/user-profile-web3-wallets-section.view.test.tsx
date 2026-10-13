import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { UserProfileWeb3Provider, UserProfileWeb3Wallet } from '../user-profile-web3-wallets-section.types';
import { UserProfileWeb3WalletsSectionView } from '../user-profile-web3-wallets-section.view';

type Animated = { getAnimations?: () => Animation[] };

function holdExits() {
  const exit = createDeferredPromise();
  (Element.prototype as Animated).getAnimations = () => [{ finished: exit.promise } as Animation];
  return exit;
}

const metamask: UserProfileWeb3Provider = { id: 'web3_metamask_signature', provider: 'MetaMask' };
const coinbase: UserProfileWeb3Provider = { id: 'web3_coinbase_wallet_signature', provider: 'Coinbase Wallet' };
const metamaskWallet: UserProfileWeb3Wallet = {
  id: 'wallet_1',
  providerId: 'web3_metamask_signature',
  provider: 'MetaMask',
  address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  isPrimary: true,
  isVerified: true,
};
const coinbaseWallet: UserProfileWeb3Wallet = {
  id: 'wallet_2',
  providerId: 'web3_coinbase_wallet_signature',
  provider: 'Coinbase Wallet',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  isVerified: true,
};

const rowOf = (name: string) => screen.getByText(name).closest<HTMLElement>('.cl-section-row');
const rowNames = () =>
  Array.from(document.querySelectorAll('.cl-section-row .cl-section-label > span:first-child')).map(
    label => label.textContent,
  );

describe('UserProfileWeb3WalletsSectionView', () => {
  afterEach(() => {
    delete (Element.prototype as Animated).getAnimations;
  });

  it('connects a provider in its own row, expanding the address', () => {
    const { rerender } = render(
      <UserProfileWeb3WalletsSectionView
        wallets={[metamaskWallet]}
        availableProviders={[coinbase]}
        onConnect={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    const row = rowOf('Coinbase Wallet');
    expect(rowNames()).toEqual(['MetaMask', 'Coinbase Wallet']);

    rerender(
      <UserProfileWeb3WalletsSectionView
        wallets={[metamaskWallet, coinbaseWallet]}
        availableProviders={[]}
        onConnect={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(rowOf('Coinbase Wallet')).toBe(row);
    expect(rowNames()).toEqual(['MetaMask', 'Coinbase Wallet']);
    expect(row).not.toHaveAttribute('data-starting-style');
    expect(screen.getByText('0x1234...5678').closest('.cl-section-description')).toHaveAttribute('data-starting-style');
    expect(within(row as HTMLElement).getByRole('button', { name: 'Manage Coinbase Wallet' })).toBeInTheDocument();
  });

  it('turns a removed wallet back into its Connect row while the address collapses', async () => {
    const exit = holdExits();
    const { rerender } = render(
      <UserProfileWeb3WalletsSectionView
        wallets={[metamaskWallet, coinbaseWallet]}
        availableProviders={[]}
        onConnect={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    const row = rowOf('MetaMask');

    rerender(
      <UserProfileWeb3WalletsSectionView
        wallets={[coinbaseWallet]}
        availableProviders={[metamask]}
        onConnect={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(rowOf('MetaMask')).toBe(row);
    expect(rowNames()).toEqual(['MetaMask', 'Coinbase Wallet']);
    expect(screen.getByText('0x71C7...976F').closest('.cl-section-description')).toHaveAttribute('data-ending-style');
    expect(within(row as HTMLElement).getByRole('button', { name: 'Connect MetaMask' })).toBeInTheDocument();

    await act(async () => {
      exit.resolve();
      await exit.promise;
    });
    expect(screen.queryByText('0x71C7...976F')).not.toBeInTheDocument();
  });

  it('keeps a second wallet of the same provider on its own row', () => {
    render(
      <UserProfileWeb3WalletsSectionView
        wallets={[metamaskWallet, { ...metamaskWallet, id: 'wallet_3', isPrimary: false, address: '0xabcdef1234' }]}
        availableProviders={[coinbase]}
        onConnect={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getAllByRole('button', { name: 'Manage MetaMask' })).toHaveLength(2);
    expect(rowNames()).toEqual(['MetaMask', 'MetaMask', 'Coinbase Wallet']);
  });

  it('keeps an unverified wallet beside the Connect row for its provider', () => {
    const { rerender } = render(
      <UserProfileWeb3WalletsSectionView
        wallets={[{ ...metamaskWallet, isPrimary: false, isVerified: false }]}
        availableProviders={[metamask]}
        onConnect={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    const walletRow = screen.getByText('Unverified').closest('.cl-section-row');
    expect(rowNames()).toEqual(['MetaMask', 'MetaMask']);
    expect(screen.getByRole('button', { name: 'Connect MetaMask' })).toBeInTheDocument();

    rerender(
      <UserProfileWeb3WalletsSectionView
        wallets={[metamaskWallet]}
        availableProviders={[]}
        onConnect={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText('Primary').closest('.cl-section-row')).toBe(walletRow);
    expect(rowNames()).toEqual(['MetaMask']);
  });
});
