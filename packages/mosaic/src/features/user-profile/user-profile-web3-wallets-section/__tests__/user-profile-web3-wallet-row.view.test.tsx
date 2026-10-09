import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { UserProfileWeb3WalletRowView } from '../user-profile-web3-wallet-row.view';
import type { UserProfileWeb3Wallet } from '../user-profile-web3-wallets-section.types';

type Animated = { getAnimations?: () => Animation[] };

function holdExits() {
  const exit = createDeferredPromise();
  (Element.prototype as Animated).getAnimations = () => [{ finished: exit.promise } as Animation];
  return exit;
}

const address = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
const shortAddress = '0x71C7...976F';
const wallet: UserProfileWeb3Wallet = {
  id: 'wallet_1',
  provider: 'MetaMask',
  address,
  isVerified: true,
};

describe('UserProfileWeb3WalletRowView', () => {
  afterEach(() => {
    delete (Element.prototype as Animated).getAnimations;
  });

  it('shows a first-load address without an entrance', () => {
    render(<UserProfileWeb3WalletRowView wallet={wallet} />);

    const description = screen.getByText(shortAddress).closest('.cl-section-description');
    expect(description).toHaveAttribute('data-open');
    expect(description).not.toHaveAttribute('data-starting-style');
    expect(description).toHaveAttribute('title', address);
  });

  it('expands the address once the wallet has a provider', () => {
    const { rerender } = render(<UserProfileWeb3WalletRowView wallet={{ ...wallet, provider: undefined }} />);
    expect(screen.queryByText(shortAddress)?.closest('.cl-section-description')).toBeNull();

    rerender(<UserProfileWeb3WalletRowView wallet={wallet} />);
    expect(screen.getByText(shortAddress).closest('.cl-section-description')).toHaveAttribute('data-starting-style');
  });

  it('holds the address through its exit once the provider is gone', async () => {
    const exit = holdExits();
    const { rerender } = render(<UserProfileWeb3WalletRowView wallet={wallet} />);

    rerender(<UserProfileWeb3WalletRowView wallet={{ ...wallet, provider: undefined }} />);
    const description = screen
      .getAllByText(shortAddress)
      .map(element => element.closest('.cl-section-description'))
      .find(Boolean);
    expect(description).toHaveAttribute('data-ending-style');
    expect(description).toHaveAttribute('aria-hidden', 'true');

    await act(async () => {
      exit.resolve();
      await exit.promise;
    });
    expect(screen.getAllByText(shortAddress)).toHaveLength(1);
    expect(screen.getByText(shortAddress).closest('.cl-section-description')).toBeNull();
  });
});
