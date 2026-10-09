import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useDestructiveController } from '../../../blocks/destructive/destructive.controller';
import { MosaicProvider } from '../../../mosaic-provider';
import { UserProfileDangerSectionView } from '../user-profile-danger-section/user-profile-danger-section.view';
import type { UserProfileProfilePanelViewProps } from '../user-profile-profile-panel.view';
import { UserProfileProfilePanelView } from '../user-profile-profile-panel.view';
import { UserProfileWeb3WalletsSectionView } from '../user-profile-web3-wallets-section/user-profile-web3-wallets-section.view';

function DeleteAccount() {
  const controller = useDestructiveController({ onDelete: () => Promise.resolve() });
  return <UserProfileDangerSectionView {...controller} />;
}

function renderView(overrides: UserProfileProfilePanelViewProps = {}) {
  return render(
    <MosaicProvider>
      <UserProfileProfilePanelView {...overrides} />
    </MosaicProvider>,
  );
}

describe('UserProfileProfilePanelView', () => {
  it('titles the panel Account without profile navigation', () => {
    renderView();

    expect(screen.getByRole('heading', { level: 2, name: 'Account' })).toBeInTheDocument();
    expect(screen.queryByRole('tab')).toBeNull();
  });

  it('places the sections in the order of the composed profile page', () => {
    renderView({
      dangerSlot: <div data-testid='danger' />,
      web3WalletsSlot: <div data-testid='web3' />,
      enterpriseAccountsSlot: <div data-testid='enterprise' />,
      connectedAccountsSlot: <div data-testid='connected' />,
      phoneSlot: <div data-testid='phone' />,
      emailSlot: <div data-testid='email' />,
      profileSlot: <div data-testid='profile' />,
    });

    const order = ['profile', 'email', 'phone', 'connected', 'enterprise', 'web3', 'danger'];
    const rendered = Array.from(document.querySelectorAll('[data-testid]'), node => node.getAttribute('data-testid'));
    expect(rendered).toEqual(order);
  });

  it('keeps the final wallet confirmation mounted until removal settles', async () => {
    const user = userEvent.setup();
    const titleRef = createRef<HTMLDivElement>();
    const removal = createDeferredPromise();
    const onRemoveWeb3Wallet = vi.fn(async () => {
      await removal.promise;
    });
    const { rerender } = renderView({
      titleRef,
      web3WalletsSlot: (
        <UserProfileWeb3WalletsSectionView
          wallets={[{ id: 'wallet_1', provider: 'MetaMask', address: '0x1234', isVerified: true }]}
          fallbackFocus={() => titleRef.current}
          onRemove={onRemoveWeb3Wallet}
        />
      ),
    });
    await user.click(screen.getByRole('button', { name: 'Manage MetaMask' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove wallet' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    rerender(
      <MosaicProvider>
        <UserProfileProfilePanelView
          titleRef={titleRef}
          web3WalletsSlot={
            <UserProfileWeb3WalletsSectionView
              wallets={[]}
              fallbackFocus={() => titleRef.current}
              onRemove={onRemoveWeb3Wallet}
            />
          }
        />
      </MosaicProvider>,
    );
    expect(screen.queryByRole('heading', { name: 'Web3 wallets' })).not.toBeInTheDocument();
    expect(screen.getByRole('alertdialog')).toHaveTextContent('0x1234');
    await act(async () => {
      removal.resolve();
      await removal.promise;
    });
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('renders the danger zone when provided', () => {
    renderView({
      dangerSlot: <DeleteAccount />,
    });

    expect(screen.getByRole('heading', { level: 3, name: 'Danger zone' })).toBeInTheDocument();
    expect(screen.getByText('Delete account', { selector: '.cl-section-label > *' })).toBeInTheDocument();
    expect(screen.getByText('Permanently delete this account and all its data. This cannot be undone.')).toHaveClass(
      'cl-section-description',
    );
  });

  it('places enterprise accounts before Web3 wallets and the danger zone', () => {
    renderView({
      web3WalletsSlot: (
        <UserProfileWeb3WalletsSectionView
          wallets={[{ id: 'wallet_1', provider: 'MetaMask', address: '0x1234', isVerified: true }]}
        />
      ),
      enterpriseAccountsSlot: <div data-testid='enterprise'>Enterprise accounts</div>,
      dangerSlot: <DeleteAccount />,
    });

    const wallets = screen.getByRole('group', { name: 'Web3 wallets' });
    const enterprise = screen.getByTestId('enterprise');
    const danger = screen.getByRole('heading', { name: 'Danger zone' });
    expect(enterprise.compareDocumentPosition(wallets) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(enterprise.compareDocumentPosition(danger) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders Web3 images inside icon frames', () => {
    const { container } = renderView({
      web3WalletsSlot: (
        <UserProfileWeb3WalletsSectionView
          wallets={[
            { id: 'metamask', provider: 'MetaMask', address: 'test', isVerified: true, iconUrl: '/metamask.svg' },
          ]}
        />
      ),
    });

    const frames = container.querySelectorAll('.cl-icon-frame');
    const images = container.querySelectorAll('img');
    expect(frames).toHaveLength(1);
    expect(screen.queryByRole('img', { name: 'MetaMask' })).not.toBeInTheDocument();
    expect(frames[0]).toContainElement(images[0]);
    frames.forEach(frame => expect(frame.closest('.cl-section-media')).toHaveAttribute('data-size', 'lg'));
  });

  it('composes linked wallets and available providers', () => {
    renderView({
      web3WalletsSlot: (
        <UserProfileWeb3WalletsSectionView
          wallets={[
            {
              id: 'primary',
              address: '0x1234567890abcdef1234567890abcdef12345678',
              provider: 'MetaMask',
              iconUrl: 'https://example.com/metamask.svg',
              isPrimary: true,
              isVerified: true,
            },
            {
              id: 'secondary',
              address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
              provider: 'Coinbase Wallet',
              isVerified: true,
            },
          ]}
          availableProviders={[{ id: 'disconnected', provider: 'Coinbase Wallet' }]}
          onConnect={vi.fn()}
          onSetPrimary={vi.fn()}
          onRemove={vi.fn()}
        />
      ),
    });

    expect(screen.getByRole('heading', { level: 3, name: 'Web3 wallets' })).toBeInTheDocument();
    expect(screen.getByText('MetaMask')).toBeInTheDocument();
    expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
    expect(within(screen.getByRole('group', { name: 'Web3 wallets' })).getByText('Primary')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Connect Coinbase Wallet' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Manage Coinbase Wallet' })).toBeVisible();
  });
});
