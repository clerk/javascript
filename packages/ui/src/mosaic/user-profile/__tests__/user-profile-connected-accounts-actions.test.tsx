import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import { UserProfileConnectedAccountsSectionView } from '../user-profile-connected-accounts-section.view';

const account = { id: 'github', provider: 'GitHub', identifier: 'test' };

function renderAccounts(onRemove: (id: string) => void | Promise<void>) {
  return render(
    <MosaicProvider>
      <UserProfileConnectedAccountsSectionView
        accounts={[account]}
        onRemove={onRemove}
      />
    </MosaicProvider>,
  );
}

async function openRemoval(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Manage GitHub' }));
  await user.click(screen.getByRole('menuitem', { name: 'Remove' }));
}

describe('connected account removal', () => {
  it('returns keyboard focus to the menu when canceled', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    renderAccounts(onRemove);
    const trigger = screen.getByRole('button', { name: 'Manage GitHub' });
    trigger.focus();
    await user.keyboard('{Enter}{Enter}');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('keeps focus in the section when a removed account disappears', async () => {
    const user = userEvent.setup();
    function Example() {
      const [accounts, setAccounts] = useState([account]);
      return (
        <MosaicProvider>
          <UserProfileConnectedAccountsSectionView
            accounts={accounts}
            onRemove={id => setAccounts(current => current.filter(item => item.id !== id))}
          />
        </MosaicProvider>
      );
    }
    render(<Example />);
    await openRemoval(user);
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Manage GitHub' })).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole('region', { name: 'Connected accounts' })).toHaveFocus());
  });

  it('shows a removal failure and allows retrying', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn().mockRejectedValueOnce(new Error('Unable to disconnect')).mockResolvedValueOnce(undefined);
    renderAccounts(onRemove);
    await openRemoval(user);
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to disconnect');
    await openRemoval(user);
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
