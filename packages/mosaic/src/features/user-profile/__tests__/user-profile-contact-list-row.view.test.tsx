import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { UserProfileContactListRowView } from '../user-profile-account-section/user-profile-contact-list-row.view';

describe('UserProfileContactListRowView', () => {
  it.each(['email', 'phone'] as const)('hides the menu when no %s action applies', kind => {
    const onVerify = vi.fn();
    const onSetPrimary = vi.fn();
    const onRemove = vi.fn();
    const item = { id: 'contact_1', value: 'Contact', isDefault: true, isVerified: true, canRemove: false };
    render(
      <UserProfileContactListRowView
        kind={kind}
        label='Contacts'
        items={[item]}
        onVerify={onVerify}
        onSetPrimary={onSetPrimary}
        onRemove={onRemove}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Manage Contact' })).not.toBeInTheDocument();
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
