import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { UserProfileWeb3WalletsSectionView } from '../user-profile-web3-wallets-section.view';

const wallet = { id: 'wallet_1', provider: 'MetaMask', address: 'test', isVerified: true };

function renderWallets(onRemove: (id: string) => void) {
  return render(
    <MosaicProvider>
      <UserProfileWeb3WalletsSectionView
        wallets={[wallet]}
        onRemove={onRemove}
      />
    </MosaicProvider>,
  );
}

async function openRemoval(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Manage MetaMask' }));
  await user.click(screen.getByRole('menuitem', { name: 'Remove wallet' }));
}

describe('Web3 wallet removal', () => {
  it('returns keyboard focus to the menu when canceled', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    renderWallets(onRemove);
    const trigger = screen.getByRole('button', { name: 'Manage MetaMask' });
    trigger.focus();
    await user.keyboard('{Enter}{Enter}');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('removes the wallet and its dialog when the caller updates the list', async () => {
    const user = userEvent.setup();
    function Example() {
      const [wallets, setWallets] = useState([wallet]);
      return (
        <MosaicProvider>
          <UserProfileWeb3WalletsSectionView
            wallets={wallets}
            onRemove={id => setWallets(current => current.filter(item => item.id !== id))}
          />
        </MosaicProvider>
      );
    }
    render(<Example />);
    await openRemoval(user);
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Manage MetaMask' })).not.toBeInTheDocument());
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('keeps confirmation open while pending and allows retrying an error supplied by the caller', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const { rerender } = renderWallets(onRemove);
    await openRemoval(user);
    const dialog = screen.getByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Remove', exact: true }));
    expect(onRemove).toHaveBeenCalledExactlyOnceWith('wallet_1');
    rerender(
      <MosaicProvider>
        <UserProfileWeb3WalletsSectionView
          wallets={[{ ...wallet, isRemoving: true }]}
          onRemove={onRemove}
        />
      </MosaicProvider>,
    );
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(within(dialog).getByRole('progressbar')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Remove', exact: true }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    rerender(
      <MosaicProvider>
        <UserProfileWeb3WalletsSectionView
          wallets={[{ ...wallet, removalError: 'Unable to remove wallet' }]}
          onRemove={onRemove}
        />
      </MosaicProvider>,
    );
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Unable to remove wallet');
    await user.click(within(dialog).getByRole('button', { name: 'Remove', exact: true }));
    expect(onRemove).toHaveBeenCalledTimes(2);
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });
});
