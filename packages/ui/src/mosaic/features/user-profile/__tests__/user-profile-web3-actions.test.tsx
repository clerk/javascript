import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import { UserProfileWeb3WalletsSectionView } from '../user-profile-web3-wallets-section.view';

const wallet = { id: 'wallet_1', provider: 'MetaMask', address: 'test', isVerified: true };

function renderWallets(onRemove: (id: string) => void | Promise<void>) {
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
    await user.keyboard('{Enter}');
    await screen.findByRole('menuitem', { name: 'Remove wallet' });
    await user.keyboard('{ArrowDown}{Enter}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
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
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Manage MetaMask' })).not.toBeInTheDocument());
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('keeps confirmation open while pending and allows retrying a rejected removal', async () => {
    const user = userEvent.setup();
    const removal = createDeferredPromise();
    const onRemove = vi
      .fn()
      .mockImplementationOnce(async () => {
        await removal.promise;
      })
      .mockResolvedValue(undefined);
    renderWallets(onRemove);
    await openRemoval(user);
    const dialog = screen.getByRole('dialog');
    const remove = within(dialog).getByRole('button', { name: 'Remove', exact: true });
    await user.click(remove);
    expect(onRemove).toHaveBeenCalledExactlyOnceWith('wallet_1');
    expect(dialog).toBeInTheDocument();
    expect(remove).toHaveAttribute('aria-busy', 'true');
    await user.click(remove);
    expect(onRemove).toHaveBeenCalledOnce();
    await act(async () => {
      removal.reject(new Error('Unable to remove wallet'));
      await removal.promise.catch(() => undefined);
    });
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Unable to remove wallet');
    await user.click(remove);
    expect(onRemove).toHaveBeenNthCalledWith(2, 'wallet_1');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('uses the newly selected wallet and its warning after canceling another removal', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <MosaicProvider>
        <UserProfileWeb3WalletsSectionView
          wallets={[
            wallet,
            { id: 'wallet_2', provider: 'Coinbase Wallet', address: 'second-wallet', isVerified: false },
          ]}
          onRemove={onRemove}
        />
      </MosaicProvider>,
    );
    await openRemoval(user);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Manage Coinbase Wallet' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove wallet' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('second-wallet');
    expect(dialog).not.toHaveTextContent('You will no longer be able to sign in using this web3 wallet.');
    await user.click(within(dialog).getByRole('button', { name: 'Remove', exact: true }));
    expect(onRemove).toHaveBeenCalledExactlyOnceWith('wallet_2');
  });
});
