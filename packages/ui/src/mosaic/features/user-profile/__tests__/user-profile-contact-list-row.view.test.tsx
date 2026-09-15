import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { UserProfileContactListRowView } from '../user-profile-account-section/user-profile-contact-list-row.view';

describe('UserProfileContactListRowView', () => {
  it('lists the primary item first, keeping the rest in the given order', () => {
    render(
      <UserProfileContactListRowView
        kind='phone'
        label='Phones'
        items={[
          { id: 'contact_1', value: 'First' },
          { id: 'contact_2', value: 'Second', isDefault: true },
          { id: 'contact_3', value: 'Third' },
        ]}
      />,
    );

    const values = screen.getAllByText(/^(First|Second|Third)$/).map(element => element.textContent);
    expect(values).toEqual(['Second', 'First', 'Third']);
  });

  it.each(['email', 'phone'] as const)('hides the menu when no %s action applies', kind => {
    const onVerify = vi.fn();
    const onSetPrimary = vi.fn();
    const onRemove = vi.fn();
    const renderActionDialog = vi.fn(() => null);
    const item = { id: 'contact_1', value: 'Contact', isDefault: true, isVerified: true, canRemove: false };
    render(
      <UserProfileContactListRowView
        kind={kind}
        label='Contacts'
        items={[item]}
        onVerify={onVerify}
        onSetPrimary={onSetPrimary}
        onRemove={onRemove}
        renderActionDialog={renderActionDialog}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Manage Contact' })).not.toBeInTheDocument();
    expect(renderActionDialog).not.toHaveBeenCalled();
  });

  it('offers removal when it applies', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <UserProfileContactListRowView
        kind='phone'
        label='Phones'
        items={[{ id: 'contact_1', value: 'Contact' }]}
        onRemove={onRemove}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Manage Contact' }));
    expect(screen.queryByRole('menuitem', { name: 'Manage', exact: true })).not.toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Remove phone number' }));
    expect(onRemove).toHaveBeenCalledExactlyOnceWith('contact_1');
  });
});
