import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { UserProfileWeb3WalletsSectionView } from '../user-profile-web3-wallets-section.view';

describe('Web3 wallets section', () => {
  it.each([
    { isPrimary: true, isVerified: true, canSetPrimary: false },
    { isPrimary: false, isVerified: true, canSetPrimary: true },
    { isPrimary: false, isVerified: false, canSetPrimary: false },
  ])(
    'offers only applicable legacy wallet actions ($isPrimary, $isVerified)',
    async ({ isPrimary, isVerified, canSetPrimary }) => {
      const user = userEvent.setup();
      const onSetPrimary = vi.fn();
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
          onSetPrimary={onSetPrimary}
          onRemove={vi.fn()}
        />,
      );
      expect(screen.getByText('MetaMask')).toBeVisible();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Manage MetaMask' }));
      expect(screen.getByRole('menuitem', { name: 'Remove wallet' })).toBeVisible();
      expect(screen.getAllByRole('menuitem')).toHaveLength(canSetPrimary ? 2 : 1);
      if (canSetPrimary) {
        await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
        expect(onSetPrimary).toHaveBeenCalledExactlyOnceWith('wallet_1');
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
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toHaveTextContent(address);
      const warning = within(dialog).queryByText('You will no longer be able to sign in using this web3 wallet.');
      if (isVerified) {
        expect(warning).toBeVisible();
      } else {
        expect(warning).not.toBeInTheDocument();
      }
    },
  );

  it('shows connection errors beside the provider and forwards retry', async () => {
    const user = userEvent.setup();
    const onConnect = vi.fn();
    render(
      <UserProfileWeb3WalletsSectionView
        wallets={[]}
        availableProviders={[{ id: 'metamask', provider: 'MetaMask', connectError: 'Wallet extension not found' }]}
        onConnect={onConnect}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Wallet extension not found');
    await user.click(screen.getByRole('button', { name: 'Connect MetaMask' }));
    expect(onConnect).toHaveBeenCalledExactlyOnceWith('metamask');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows the supplied primary error and forwards another set-primary attempt', async () => {
    const user = userEvent.setup();
    const onSetPrimary = vi.fn();
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
        onSetPrimary={onSetPrimary}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to set primary');
    await user.click(screen.getByRole('button', { name: 'Manage MetaMask' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    expect(onSetPrimary).toHaveBeenCalledExactlyOnceWith('wallet_1');
  });

  it('forwards provider IDs separately from wallet IDs without filtering unverified wallets', async () => {
    const user = userEvent.setup();
    const onConnect = vi.fn();
    const onRemove = vi.fn();
    render(
      <UserProfileWeb3WalletsSectionView
        wallets={[{ id: 'wallet_1', provider: 'MetaMask', address: '0x1234', isVerified: false }]}
        availableProviders={[{ id: 'metamask', provider: 'MetaMask' }]}
        onConnect={onConnect}
        onRemove={onRemove}
      />,
    );
    expect(screen.getByText('Unverified')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Connect MetaMask' }));
    expect(onConnect).toHaveBeenCalledExactlyOnceWith('metamask');
    await user.click(screen.getByRole('button', { name: 'Manage MetaMask' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove wallet' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove', exact: true }));
    expect(onRemove).toHaveBeenCalledExactlyOnceWith('wallet_1');
  });
});
