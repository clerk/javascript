import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../../MosaicProvider';
import type { UserProfileAccountSectionViewProps } from '../user-profile-account-section/user-profile-account-section.view';
import { UserProfileAccountSectionView } from '../user-profile-account-section/user-profile-account-section.view';

function renderEmail(overrides: Partial<UserProfileAccountSectionViewProps> = {}) {
  return render(
    <MosaicProvider>
      <UserProfileAccountSectionView
        allowMultipleAccounts
        name='Test'
        username='test'
        phones={[]}
        emails={[{ id: 'email_1', value: 'test@example.com', isVerified: true }]}
        {...overrides}
      />
    </MosaicProvider>,
  );
}

describe('email actions', () => {
  it('returns focus to the email menu after opening with the keyboard and canceling with Escape', async () => {
    const user = userEvent.setup();
    const onRemoveEmail = vi.fn();
    renderEmail({ onRemoveEmail });
    const trigger = screen.getByRole('button', { name: 'Manage test@example.com' });

    trigger.focus();
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog', { name: 'Remove email address?' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onRemoveEmail).not.toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('removes the email row and keeps Add email available', async () => {
    const user = userEvent.setup();
    function Example() {
      const [emails, setEmails] = useState([{ id: 'email_1', value: 'test@example.com', isVerified: true }]);
      return (
        <MosaicProvider>
          <UserProfileAccountSectionView
            allowMultipleAccounts
            name='Test'
            username='test'
            phones={[]}
            emails={emails}
            onSendEmailCode={() => Promise.resolve()}
            onVerifyEmailCode={() => Promise.resolve()}
            onRemoveEmail={id => setEmails(current => current.filter(email => email.id !== id))}
          />
        </MosaicProvider>
      );
    }
    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Manage test@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove email' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Manage test@example.com' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add email' })).toBeEnabled();
  });

  it('shows a primary update error without opening a dialog', async () => {
    const user = userEvent.setup();
    const onSetPrimaryEmail = vi.fn().mockRejectedValue(new Error('Unable to update primary email.'));
    renderEmail({ onSetPrimaryEmail });
    await user.click(screen.getByRole('button', { name: 'Manage test@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    expect(onSetPrimaryEmail).toHaveBeenCalledExactlyOnceWith('email_1');
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to update primary email.');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('keeps removal pending and lets the user retry a failure in the dialog', async () => {
    const user = userEvent.setup();
    const removal = Promise.withResolvers<void>();
    const onRemoveEmail = vi.fn().mockReturnValueOnce(removal.promise).mockResolvedValue(undefined);
    renderEmail({ onRemoveEmail });
    await user.click(screen.getByRole('button', { name: 'Manage test@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove email' }));
    const dialog = screen.getByRole('dialog', { name: 'Remove email address?' });
    expect(dialog).toHaveAccessibleDescription(/test@example.com/);
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    expect(within(dialog).getByRole('button', { name: 'Remove' })).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      removal.reject(new Error('Unable to remove email.'));
      await removal.promise.catch(() => undefined);
    });
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Unable to remove email.');
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onRemoveEmail).toHaveBeenNthCalledWith(1, 'email_1');
    expect(onRemoveEmail).toHaveBeenNthCalledWith(2, 'email_1');
  });
});
