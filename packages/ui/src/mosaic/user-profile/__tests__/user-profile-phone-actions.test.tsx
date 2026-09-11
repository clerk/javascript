import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
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
        phones={[{ id: 'phone_1', value: '+18015550100', isVerified: true }]}
        {...overrides}
      />
    </MosaicProvider>,
  );
}

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

  it('closes confirmation before deletion finishes and prevents duplicate requests', async () => {
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
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove phone number' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(onRemovePhone).toHaveBeenCalledOnce();
    finish();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('hides set primary while an update is pending', async () => {
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
    expect(screen.queryByRole('menuitem', { name: 'Set as primary' })).not.toBeInTheDocument();
    expect(onSetPrimaryPhone).toHaveBeenCalledOnce();
    finish();
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Set as primary' })).toBeInTheDocument());
  });
  it.each([{ isDefault: true, isVerified: true }, { isDefault: false, isVerified: false }, { isDefault: false }])(
    'hides set primary for an ineligible phone: %j',
    async flags => {
      const user = userEvent.setup();
      renderPhone({
        phones: [{ id: 'phone_1', value: '+18015550100', ...flags }],
        onSetPrimaryPhone: vi.fn(),
        onRemovePhone: vi.fn(),
      });
      await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
      expect(screen.queryByRole('menuitem', { name: 'Set as primary' })).not.toBeInTheDocument();
    },
  );

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
    expect(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' })).toHaveFocus();
  });

  it('shows a failed removal in the account section and allows retry from the menu', async () => {
    const user = userEvent.setup();
    const onRemovePhone = vi
      .fn()
      .mockRejectedValueOnce(new Error('Cannot remove this phone.'))
      .mockResolvedValue(undefined);
    renderPhone({ onRemovePhone });
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove phone number' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Cannot remove this phone.');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove phone number' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onRemovePhone).toHaveBeenCalledTimes(2);
  });

  it('does not offer removal when it is forbidden', async () => {
    const user = userEvent.setup();
    renderPhone({
      phones: [{ id: 'phone_1', value: '+18015550100', isVerified: true, canRemove: false }],
      onSetPrimaryPhone: vi.fn(),
      onRemovePhone: vi.fn(),
    });
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    expect(screen.queryByRole('menuitem', { name: 'Remove phone number' })).not.toBeInTheDocument();
  });
  it('shows a primary update error without opening a dialog', async () => {
    const user = userEvent.setup();
    const onSetPrimaryPhone = vi.fn().mockRejectedValue(new Error('Unable to update primary phone.'));
    renderPhone({ onSetPrimaryPhone });
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    expect(onSetPrimaryPhone).toHaveBeenCalledExactlyOnceWith('phone_1');
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to update primary phone.');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
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
          phones={[{ id: 'phone_1', value: '+18015550100', isVerified: true }]}
          onRemovePhone={onRemovePhone}
        />
      </MosaicProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove phone number' }));
    expect(onRemovePhone).not.toHaveBeenCalled();
    const dialog = screen.getByRole('alertdialog', { name: 'Remove phone number?' });
    expect(dialog).toHaveTextContent('+1 (801) 555-0100');
    expect(within(dialog).queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    expect(onRemovePhone).toHaveBeenCalledExactlyOnceWith('phone_1');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });
});
