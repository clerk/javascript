import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { UserProfileContactListRowView } from '../user-profile-account-section/user-profile-contact-list-row.view';

describe('UserProfileContactListRowView', () => {
  it.each(['email', 'phone'] as const)('hides the menu when no %s action applies', kind => {
    const onVerify = vi.fn();
    const onSetPrimary = vi.fn();
    const item = { id: 'contact_1', value: 'Contact', isDefault: true, isVerified: true };
    render(
      <UserProfileContactListRowView
        kind={kind}
        label='Contacts'
        items={[item]}
        onVerify={onVerify}
        onSetPrimary={onSetPrimary}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Manage Contact' })).not.toBeInTheDocument();
  });

  it.each(['email', 'phone'] as const)('marks an unverified %s', kind => {
    render(
      <UserProfileContactListRowView
        kind={kind}
        label='Contacts'
        items={[
          { id: 'contact_1', value: 'Verified contact', isDefault: false, isVerified: true },
          { id: 'contact_2', value: 'Pending contact', isDefault: false, isVerified: false },
        ]}
      />,
    );

    expect(screen.getAllByText('Unverified')).toHaveLength(1);
    expect(screen.getByText('Pending contact').parentElement).toHaveTextContent('Unverified');
  });

  it('offers removal when it applies', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <UserProfileContactListRowView
        kind='phone'
        label='Phones'
        items={[{ id: 'contact_1', value: 'Contact', isDefault: false, isVerified: true }]}
        onRemove={onRemove}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Manage Contact' }));
    expect(screen.queryByRole('menuitem', { name: 'Manage', exact: true })).not.toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Remove phone number' }));
    expect(onRemove).toHaveBeenCalledExactlyOnceWith('contact_1');
  });
});
