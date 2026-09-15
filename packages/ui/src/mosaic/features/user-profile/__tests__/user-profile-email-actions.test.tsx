import { render, screen, waitFor, within } from '@testing-library/react';
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
    expect(screen.getByRole('alertdialog', { name: 'Remove email address?' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
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
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
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
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
