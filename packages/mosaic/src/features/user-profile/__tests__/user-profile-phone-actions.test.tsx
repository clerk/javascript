import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { clerkApiError } from '../../../__tests__/clerk-errors';
import { MosaicProvider } from '../../../mosaic-provider';
import { SaveError } from '../../../utils/errors';
import type { UserProfileAccountSectionViewProps } from '../user-profile-account-section/user-profile-account-section.view';
import { UserProfileAccountSectionView } from '../user-profile-account-section/user-profile-account-section.view';

function renderPhone(overrides: Partial<UserProfileAccountSectionViewProps> = {}) {
  return render(
    <MosaicProvider>
      <UserProfileAccountSectionView
        allowMultipleAccounts
        name='Test'
        username='test'
        emails={[]}
        phones={[{ id: 'phone_1', value: '+18015550100', isDefault: false, isVerified: true }]}
        {...overrides}
      />
    </MosaicProvider>,
  );
}

const phoneVerifier = { sendCode: () => Promise.resolve(), verifyCode: () => Promise.resolve() };

describe('phone actions', () => {
  it('ignores backdrop clicks and allows Escape to cancel removal', async () => {
    const user = userEvent.setup();
    const onRemovePhone = vi.fn();
    renderPhone({ onRemovePhone });
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove phone number' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Remove phone number?' });
    const backdrop = document.querySelector('.cl-dialog-backdrop');
    if (!backdrop) {
      throw new Error('Expected a dialog backdrop');
    }
    await user.click(backdrop);
    expect(dialog).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(onRemovePhone).not.toHaveBeenCalled();
  });

  it('keeps confirmation open until deletion finishes and prevents duplicate requests', async () => {
    const user = userEvent.setup();
    let finish = () => {};
    const pending = new Promise<void>(resolve => {
      finish = resolve;
    });
    const onRemovePhone = vi.fn(() => pending);
    renderPhone({ onRemovePhone });
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove phone number' }));
    const dialog = screen.getByRole('alertdialog');
    const remove = within(dialog).getByRole('button', { name: 'Remove' });
    await user.click(remove);
    expect(dialog).toBeInTheDocument();
    expect(remove).toHaveAttribute('aria-busy', 'true');
    await user.click(remove);
    expect(onRemovePhone).toHaveBeenCalledOnce();
    finish();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('ignores a second set primary while the first is pending', async () => {
    const user = userEvent.setup();
    let finish = () => {};
    const pending = new Promise<void>(resolve => {
      finish = resolve;
    });
    const onSetPrimaryPhone = vi.fn(() => pending);
    renderPhone({ onSetPrimaryPhone, onRemovePhone: vi.fn() });
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));

    expect(onSetPrimaryPhone).toHaveBeenCalledOnce();
    finish();
  });
  it.each([
    { isDefault: true, isVerified: true },
    { isDefault: false, isVerified: false },
  ])('hides set primary for an ineligible phone: %j', async flags => {
    const user = userEvent.setup();
    renderPhone({
      phones: [{ id: 'phone_1', value: '+18015550100', ...flags }],
      onSetPrimaryPhone: vi.fn(),
      onRemovePhone: vi.fn(),
    });
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    expect(screen.queryByRole('menuitem', { name: 'Set as primary' })).not.toBeInTheDocument();
  });

  it('updates the primary badge immediately without confirmation', async () => {
    const user = userEvent.setup();
    function Example() {
      const [phones, setPhones] = useState([
        { id: 'phone_1', value: '+18015550100', isVerified: true, isDefault: false },
      ]);
      return (
        <MosaicProvider>
          <UserProfileAccountSectionView
            allowMultipleAccounts
            name='Test'
            username='test'
            emails={[]}
            phones={phones}
            onSetPrimaryPhone={id =>
              setPhones(current => current.map(phone => ({ ...phone, isDefault: phone.id === id })))
            }
          />
        </MosaicProvider>
      );
    }
    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Manage +1 (801) 555-0100' })).not.toBeInTheDocument();
  });

  it('cancels removal without calling the mutation', async () => {
    const user = userEvent.setup();
    const onRemovePhone = vi.fn();
    renderPhone({ onRemovePhone });
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove phone number' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onRemovePhone).not.toHaveBeenCalled();
  });

  it('keeps the phone when removal is canceled with Escape', async () => {
    const user = userEvent.setup();
    const onRemovePhone = vi.fn();
    renderPhone({ onRemovePhone });
    const trigger = screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' });

    trigger.focus();
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('alertdialog', { name: 'Remove phone number?' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onRemovePhone).not.toHaveBeenCalled();
  });

  it('shows Add phone number after removing the last phone', async () => {
    const user = userEvent.setup();
    function Example() {
      const [phones, setPhones] = useState([
        { id: 'phone_1', value: '+18015550100', isDefault: false, isVerified: true },
      ]);
      return (
        <MosaicProvider>
          <UserProfileAccountSectionView
            allowMultipleAccounts
            name='Test'
            username='test'
            emails={[]}
            phones={phones}
            getPhoneVerifier={() => phoneVerifier}
            onCreatePhone={() => Promise.resolve(phoneVerifier)}
            onRemovePhone={id => setPhones(current => current.filter(phone => phone.id !== id))}
          />
        </MosaicProvider>
      );
    }
    render(<Example />);
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove phone number' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Manage +1 (801) 555-0100' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add phone number' })).toBeEnabled();
  });

  it('shows a failed removal in the dialog and allows retry', async () => {
    const user = userEvent.setup();
    const onRemovePhone = vi
      .fn()
      .mockRejectedValueOnce(clerkApiError('phone_number_in_use', 'Cannot remove this phone.'))
      .mockResolvedValue(undefined);
    renderPhone({ onRemovePhone });
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove phone number' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Cannot remove this phone.'));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onRemovePhone).toHaveBeenCalledTimes(2);
  });

  it('does not offer removal when it is forbidden', async () => {
    const user = userEvent.setup();
    renderPhone({
      phones: [{ id: 'phone_1', value: '+18015550100', isDefault: false, isVerified: true }],
      onSetPrimaryPhone: vi.fn(),
    });
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    expect(screen.queryByRole('menuitem', { name: 'Remove phone number' })).not.toBeInTheDocument();
  });
  it('shows why the primary update failed, without opening a dialog', async () => {
    const user = userEvent.setup();
    const onSetPrimaryPhone = vi.fn().mockRejectedValue(new SaveError({ global: { message: 'Not verified yet.' } }));
    renderPhone({ onSetPrimaryPhone });
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    expect(onSetPrimaryPhone).toHaveBeenCalledExactlyOnceWith('phone_1');
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Not verified yet.'));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('shows the generic message and logs a primary update that threw unexpectedly', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    const failure = new TypeError('boom');
    const onSetPrimaryPhone = vi.fn().mockRejectedValue(failure);
    renderPhone({ onSetPrimaryPhone });
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.'));
    expect(log).toHaveBeenCalledWith('[Clerk] Could not localize error', failure);
    log.mockRestore();
  });
  it('requires confirmation before removing a phone number', async () => {
    const user = userEvent.setup();
    const onRemovePhone = vi.fn();
    render(
      <MosaicProvider>
        <UserProfileAccountSectionView
          allowMultipleAccounts
          name='Test'
          username='test'
          emails={[]}
          phones={[{ id: 'phone_1', value: '+18015550100', isDefault: false, isVerified: true }]}
          onRemovePhone={onRemovePhone}
        />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove phone number' }));
    expect(onRemovePhone).not.toHaveBeenCalled();
    const dialog = screen.getByRole('alertdialog', { name: 'Remove phone number?' });
    expect(dialog).toHaveTextContent('+1 (801) 555-0100');
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    expect(onRemovePhone).toHaveBeenCalledExactlyOnceWith('phone_1');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });
  it.each([
    [true, 'You won’t be able to use it to sign in.'],
    [false, undefined],
  ])('warns about signing in only when removing a verified phone (verified: %s)', async (isVerified, warning) => {
    const user = userEvent.setup();
    renderPhone({
      phones: [{ id: 'phone_1', value: '+18015550100', isDefault: false, isVerified }],
      onRemovePhone: vi.fn(),
    });
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove phone number' }));
    const dialog = screen.getByRole('alertdialog');
    if (warning) {
      expect(dialog).toHaveTextContent(warning);
    } else {
      expect(dialog).not.toHaveTextContent('sign in');
    }
  });
});
