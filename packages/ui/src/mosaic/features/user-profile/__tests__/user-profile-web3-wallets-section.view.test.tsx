import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { UserProfileWeb3WalletsSectionView } from '../user-profile-web3-wallets-section.view';

describe('Web3 wallets section', () => {
  it.each([{ availableProviders: [] }, { availableProviders: [{ id: 'metamask', provider: 'MetaMask' }] }])(
    'hides the entire section without wallets or actionable providers (%j)',
    ({ availableProviders }) => {
      const { container } = render(
        <UserProfileWeb3WalletsSectionView
          wallets={[]}
          availableProviders={availableProviders}
        />,
      );
      expect(container).toBeEmptyDOMElement();
    },
  );

  it.each([
    { isPrimary: true, isVerified: true, canSetPrimary: false },
    { isPrimary: false, isVerified: true, canSetPrimary: true },
    { isPrimary: false, isVerified: false, canSetPrimary: false },
  ])(
    'offers only applicable legacy wallet actions ($isPrimary, $isVerified)',
    async ({ isPrimary, isVerified, canSetPrimary }) => {
      const user = userEvent.setup();
      render(
        <UserProfileWeb3WalletsSectionView
          wallets={[
            {
              id: 'wallet_1',
              provider: 'MetaMask',
              address: '0x1234',
              isPrimary,
              isVerified,
              iconUrl: '/metamask.svg',
            },
          ]}
          onSetPrimary={vi.fn()}
          onRemove={vi.fn()}
        />,
      );
      expect(screen.getByText('MetaMask')).toBeVisible();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Manage MetaMask' }));
      expect(screen.getByRole('menuitem', { name: 'Remove wallet' })).toBeVisible();
      expect(screen.getAllByRole('menuitem')).toHaveLength(canSetPrimary ? 2 : 1);
      if (canSetPrimary) {
        expect(screen.getByRole('menuitem', { name: 'Set as primary' })).toBeVisible();
      } else {
        expect(screen.queryByRole('menuitem', { name: 'Set as primary' })).not.toBeInTheDocument();
      }
    },
  );

  it.each([true, false])(
    'renders an admin wallet and limits the removal warning to verified wallets (%s)',
    async isVerified => {
      const user = userEvent.setup();
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      render(
        <UserProfileWeb3WalletsSectionView
          wallets={[{ id: 'admin_wallet', address, isVerified }]}
          onRemove={vi.fn()}
        />,
      );
      expect(screen.getByText('0x1234...5678')).toBeVisible();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: `Manage ${address}` }));
      await user.click(screen.getByRole('menuitem', { name: 'Remove wallet' }));
      const dialog = screen.getByRole('dialog');
      const warning = 'You will no longer be able to sign in using this web3 wallet.';
      if (isVerified) {
        expect(dialog).toHaveTextContent(warning);
      } else {
        expect(dialog).not.toHaveTextContent(warning);
      }
    },
  );

  it('shows connection errors while keeping Connect available', () => {
    render(
      <UserProfileWeb3WalletsSectionView
        wallets={[]}
        availableProviders={[{ id: 'metamask', provider: 'MetaMask', connectError: 'Wallet extension not found' }]}
        onConnect={vi.fn()}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Wallet extension not found');
    expect(screen.getByRole('button', { name: 'Connect MetaMask' })).toBeEnabled();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows primary errors while keeping Set as primary available', async () => {
    const user = userEvent.setup();
    render(
      <UserProfileWeb3WalletsSectionView
        wallets={[
          {
            id: 'wallet_1',
            provider: 'MetaMask',
            address: '0x1234',
            isVerified: true,
            primaryError: 'Unable to set primary',
          },
        ]}
        onSetPrimary={vi.fn()}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to set primary');
    await user.click(screen.getByRole('button', { name: 'Manage MetaMask' }));
    expect(screen.getByRole('menuitem', { name: 'Set as primary' })).toBeEnabled();
  });

  it('shows an unverified wallet alongside its available provider', () => {
    render(
      <UserProfileWeb3WalletsSectionView
        wallets={[{ id: 'wallet_1', provider: 'MetaMask', address: '0x1234', isVerified: false }]}
        availableProviders={[{ id: 'metamask', provider: 'MetaMask' }]}
        onConnect={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText('Unverified')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Connect MetaMask' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Manage MetaMask' })).toBeVisible();
  });
});
