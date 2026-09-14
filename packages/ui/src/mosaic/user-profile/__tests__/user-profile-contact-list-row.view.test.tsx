import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { UserProfileContactListRowView } from '../user-profile-account-section/user-profile-contact-list-row.view';

describe('UserProfileContactListRowView', () => {
  it.each(['email', 'phone'] as const)('falls back to manage when no explicit %s action applies', async kind => {
    const user = userEvent.setup();
    const onManage = vi.fn();
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
        onManage={onManage}
        onVerify={onVerify}
        onSetPrimary={onSetPrimary}
        onRemove={onRemove}
        renderActionDialog={renderActionDialog}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Manage Contact' }));
    expect(screen.getAllByRole('menuitem')).toHaveLength(1);
    await user.click(screen.getByRole('menuitem', { name: 'Manage', exact: true }));

    expect(onManage).toHaveBeenCalledExactlyOnceWith('contact_1');
    expect(renderActionDialog).toHaveBeenCalledWith(item);
    expect(onVerify).not.toHaveBeenCalled();
    expect(onSetPrimary).not.toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
  });

  it('uses applicable explicit actions instead of the manage fallback', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onManage = vi.fn();
    render(
      <UserProfileContactListRowView
        kind='phone'
        label='Phones'
        items={[{ id: 'contact_1', value: 'Contact' }]}
        onManage={onManage}
        onRemove={onRemove}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Manage Contact' }));
    expect(screen.queryByRole('menuitem', { name: 'Manage', exact: true })).not.toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Remove phone number' }));
    expect(onRemove).toHaveBeenCalledExactlyOnceWith('contact_1');
    expect(onManage).not.toHaveBeenCalled();
  });
});
