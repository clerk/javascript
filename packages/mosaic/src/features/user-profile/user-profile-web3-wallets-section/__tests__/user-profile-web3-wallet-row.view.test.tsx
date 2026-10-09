import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UserProfileWeb3WalletRowView } from '../user-profile-web3-wallet-row.view';
import type { UserProfileWeb3Provider, UserProfileWeb3Wallet } from '../user-profile-web3-wallets-section.types';

type Animated = { getAnimations?: () => Animation[] };

function holdExits() {
  const exit = createDeferredPromise();
  (Element.prototype as Animated).getAnimations = () => [{ finished: exit.promise } as Animation];
  return exit;
}

const address = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
const shortAddress = '0x71C7...976F';
const provider: UserProfileWeb3Provider = { id: 'web3_metamask_signature', provider: 'MetaMask' };
const wallet: UserProfileWeb3Wallet = {
  id: 'wallet_1',
  providerId: 'web3_metamask_signature',
  provider: 'MetaMask',
  address,
  isVerified: true,
};

const description = () => screen.getByText(shortAddress).closest('.cl-section-description');

describe('UserProfileWeb3WalletRowView', () => {
  afterEach(() => {
    delete (Element.prototype as Animated).getAnimations;
  });

  it('offers Connect for a provider that is not connected', () => {
    const onConnect = vi.fn();
    render(
      <UserProfileWeb3WalletRowView
        provider={provider}
        onConnect={onConnect}
      />,
    );

    expect(screen.getByText('MetaMask')).toBeInTheDocument();
    expect(screen.queryByText(shortAddress)).not.toBeInTheDocument();
    screen.getByRole('button', { name: 'Connect MetaMask' }).click();
    expect(onConnect).toHaveBeenCalledExactlyOnceWith('web3_metamask_signature');
  });

  it('shows a first-load address without an entrance', () => {
    render(<UserProfileWeb3WalletRowView wallet={wallet} />);

    expect(description()).toHaveAttribute('data-open');
    expect(description()).not.toHaveAttribute('data-starting-style');
    expect(description()).toHaveAttribute('title', address);
  });

  it('becomes the connected row in place when its provider connects', () => {
    const { rerender } = render(
      <UserProfileWeb3WalletRowView
        provider={provider}
        onConnect={vi.fn()}
      />,
    );
    const row = screen.getByText('MetaMask').closest('.cl-section-row');

    rerender(
      <UserProfileWeb3WalletRowView
        wallet={{ ...wallet, isPrimary: true }}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText('MetaMask').closest('.cl-section-row')).toBe(row);
    expect(description()).toHaveAttribute('data-starting-style');
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Connect MetaMask' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manage MetaMask' })).toBeInTheDocument();
  });

  it('offers Connect again in place while the address collapses out', async () => {
    const exit = holdExits();
    const { rerender } = render(
      <UserProfileWeb3WalletRowView
        wallet={wallet}
        onRemove={vi.fn()}
      />,
    );
    const row = screen.getByText('MetaMask').closest('.cl-section-row');

    rerender(
      <UserProfileWeb3WalletRowView
        provider={provider}
        onConnect={vi.fn()}
      />,
    );

    expect(screen.getByText('MetaMask').closest('.cl-section-row')).toBe(row);
    expect(description()).toHaveAttribute('data-ending-style');
    expect(description()).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: 'Connect MetaMask' })).toBeInTheDocument();

    await act(async () => {
      exit.resolve();
      await exit.promise;
    });
    expect(screen.queryByText(shortAddress)).not.toBeInTheDocument();
  });

  it('labels a wallet without a provider by its address, with no description', () => {
    render(<UserProfileWeb3WalletRowView wallet={{ ...wallet, providerId: undefined, provider: undefined }} />);

    expect(screen.getByText(shortAddress)).toBeInTheDocument();
    expect(screen.getByText(shortAddress).closest('.cl-section-description')).toBeNull();
  });

  it('shows the provider connect error and the wallet primary error on the same row', () => {
    const { rerender } = render(
      <UserProfileWeb3WalletRowView
        provider={{ ...provider, connectError: 'Wallet extension not found.' }}
        onConnect={vi.fn()}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Wallet extension not found.');

    rerender(<UserProfileWeb3WalletRowView wallet={{ ...wallet, isVerified: false, primaryError: 'Not primary.' }} />);
    expect(screen.getByText('Unverified')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Not primary.');
  });
});
