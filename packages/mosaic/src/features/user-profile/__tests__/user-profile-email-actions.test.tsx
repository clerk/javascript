import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { clerkApiError } from '../../../__tests__/clerk-errors';
import { MosaicProvider } from '../../../mosaic-provider';
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
  it('marks the email busy while it is being set as primary', async () => {
    const user = userEvent.setup();
    const request = createDeferredPromise();
    const onSetPrimaryEmail = vi.fn().mockReturnValue(request.promise);
    renderEmail({ onSetPrimaryEmail });
    const row = screen.getByText('test@example.com').closest('.cl-section-item');

    await user.click(screen.getByRole('button', { name: 'Manage test@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    expect(row).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      request.resolve();
      await request.promise;
    });
    expect(row).not.toHaveAttribute('aria-busy');
  });

  it('stays busy while the pending indicator is held after a slow request', async () => {
    const user = userEvent.setup();
    const onSetPrimaryEmail = vi.fn(() => new Promise<void>(resolve => setTimeout(resolve, 200)));
    renderEmail({ onSetPrimaryEmail });
    const row = screen.getByText('test@example.com').closest('.cl-section-item');

    await user.click(screen.getByRole('button', { name: 'Manage test@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    await act(() => new Promise(resolve => setTimeout(resolve, 300)));

    expect(screen.getByRole('progressbar', { name: 'Setting as primary' })).toBeInTheDocument();
    expect(row).toHaveAttribute('aria-busy', 'true');

    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument(), { timeout: 1500 });
    expect(row).not.toHaveAttribute('aria-busy');
  });

  it('keeps the list order when the primary changes, and holds the badge while the spinner shows', async () => {
    const user = userEvent.setup();
    const order = () =>
      screen.getAllByRole('button', { name: /^Manage / }).map(button => button.getAttribute('aria-label'));
    const primary = () => screen.getByText('Primary').closest('.cl-section-item')?.textContent;
    function Example() {
      const [emails, setEmails] = useState([
        { id: 'email_1', value: 'first@example.com', isDefault: true, isVerified: true },
        { id: 'email_2', value: 'second@example.com', isVerified: true },
      ]);
      return (
        <MosaicProvider>
          <UserProfileAccountSectionView
            allowMultipleAccounts
            name='Test'
            username='test'
            phones={[]}
            emails={emails}
            onRemoveEmail={vi.fn()}
            onSetPrimaryEmail={async id => {
              await new Promise(resolve => setTimeout(resolve, 200));
              setEmails(current =>
                [...current]
                  .map(email => ({ ...email, isDefault: email.id === id }))
                  .sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
              );
            }}
          />
        </MosaicProvider>
      );
    }
    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Manage second@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));

    await act(() => new Promise(resolve => setTimeout(resolve, 300)));
    expect(primary()).toContain('first@example.com');
    expect(
      screen.getByRole('progressbar', { name: 'Setting as primary' }).closest('.cl-section-item'),
    ).toHaveTextContent('second@example.com');

    await waitFor(() => expect(primary()).toContain('second@example.com'), { timeout: 1500 });
    expect(order()).toEqual(['Manage first@example.com', 'Manage second@example.com']);
  });

  it('shows a primary update error without opening a dialog', async () => {
    const user = userEvent.setup();
    const onSetPrimaryEmail = vi.fn().mockRejectedValue(new Error('Unable to update primary email.'));
    renderEmail({ onSetPrimaryEmail });
    await user.click(screen.getByRole('button', { name: 'Manage test@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    expect(onSetPrimaryEmail).toHaveBeenCalledExactlyOnceWith('email_1');
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to update primary email.'));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('keeps removal pending and lets the user retry a failure in the dialog', async () => {
    const user = userEvent.setup();
    const removal = createDeferredPromise();
    const onRemoveEmail = vi.fn().mockReturnValueOnce(removal.promise).mockResolvedValue(undefined);
    renderEmail({ onRemoveEmail });
    await user.click(screen.getByRole('button', { name: 'Manage test@example.com' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove email' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Remove email address?' });
    expect(dialog).toHaveAccessibleDescription(/test@example.com/);
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    expect(within(dialog).getByRole('button', { name: 'Remove' })).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      removal.reject(clerkApiError('email_address_in_use', 'Unable to remove email.'));
      await removal.promise.catch(() => undefined);
    });
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Unable to remove email.');
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onRemoveEmail).toHaveBeenNthCalledWith(1, 'email_1');
    expect(onRemoveEmail).toHaveBeenNthCalledWith(2, 'email_1');
  });
});
