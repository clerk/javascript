import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
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
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('closes confirmation when the caller removes the account', async () => {
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
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Manage GitHub' })).not.toBeInTheDocument());
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.queryByText('Connected accounts')).not.toBeInTheDocument();
  });

  it('shows a removal failure and allows retrying', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn().mockRejectedValueOnce(new Error('Unable to disconnect')).mockResolvedValue(undefined);
    renderAccounts(onRemove);
    await openRemoval(user);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to disconnect');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('keeps the selected account pending until its removal finishes', async () => {
    const user = userEvent.setup();
    const removal = Promise.withResolvers<void>();
    const onRemove = vi.fn(() => removal.promise);
    renderAccounts(onRemove);
    await openRemoval(user);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove' }));

    expect(onRemove).toHaveBeenCalledExactlyOnceWith('github');
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    await act(async () => {
      removal.resolve();
      await removal.promise;
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('opens the same confirmation for the chosen account after cancelling another', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <MosaicProvider>
        <UserProfileConnectedAccountsSectionView
          accounts={[account, { id: 'google', provider: 'Google' }]}
          onRemove={onRemove}
        />
      </MosaicProvider>,
    );
    await openRemoval(user);
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription(/GitHub will be removed/);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Manage GitHub' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove' }));
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription(/Google will be removed/);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledExactlyOnceWith('google');
  });

  it('keeps removal callbacks isolated between section instances', async () => {
    const user = userEvent.setup();
    const removeGitHub = vi.fn();
    const removeGoogle = vi.fn();
    render(
      <MosaicProvider>
        <UserProfileConnectedAccountsSectionView
          accounts={[account]}
          onRemove={removeGitHub}
        />
        <UserProfileConnectedAccountsSectionView
          accounts={[{ id: 'google', provider: 'Google' }]}
          onRemove={removeGoogle}
        />
      </MosaicProvider>,
    );
    await openRemoval(user);
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription(/GitHub will be removed/);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(removeGitHub).toHaveBeenCalledExactlyOnceWith('github');
    expect(removeGoogle).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove' }));
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription(/Google will be removed/);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove' }));
    expect(removeGoogle).toHaveBeenCalledExactlyOnceWith('google');
    expect(removeGitHub).toHaveBeenCalledTimes(1);
  });
});
