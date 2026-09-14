import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { UserProfileWeb3WalletsSectionView } from '../user-profile-web3-wallets-section.view';

const wallet = { id: 'metamask', provider: 'MetaMask', address: 'test' };

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
    await user.keyboard('{Enter}{Enter}');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('keeps focus in the section when a removed wallet disappears', async () => {
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
    await waitFor(() => expect(screen.getByRole('region', { name: 'Web3 wallets' })).toHaveFocus());
  });

  it('shows a removal failure and allows retrying', async () => {
    const user = userEvent.setup();
    const onRemove = vi
      .fn()
      .mockRejectedValueOnce(new Error('Unable to remove wallet'))
      .mockResolvedValueOnce(undefined);
    renderWallets(onRemove);
    await openRemoval(user);
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to remove wallet');
    await openRemoval(user);
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
