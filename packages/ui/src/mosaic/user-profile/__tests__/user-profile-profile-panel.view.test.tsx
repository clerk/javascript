import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import type { UserProfileProfilePanelViewProps } from '../user-profile-profile-panel.view';
import { UserProfileProfilePanelView } from '../user-profile-profile-panel.view';

const props: UserProfileProfilePanelViewProps = {
  name: 'Preston Booth',
  username: 'prestonxyz',
  emails: [
    { id: 'email_1', value: 'item1@clerk.dev', isDefault: true },
    { id: 'email_2', value: 'item2@clerk.dev' },
  ],
  phones: [{ id: 'phone_1', value: '+1 801-888-8181' }],
};

function renderView(overrides: Partial<UserProfileProfilePanelViewProps> = {}) {
  return render(
    <MosaicProvider>
      <UserProfileProfilePanelView
        {...props}
        {...overrides}
      />
    </MosaicProvider>,
  );
}

describe('UserProfileProfilePanelView', () => {
  it('composes the profile content without profile navigation', () => {
    renderView({ onEditProfilePicture: vi.fn() });

    expect(screen.getByRole('heading', { name: 'Account' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Account' }).nextElementSibling).toHaveClass('cl-card-root');
    const nameInput = screen.getByRole('textbox', { name: 'Name' });
    const usernameInput = screen.getByRole('textbox', { name: 'Username' });
    expect(nameInput).toHaveValue('Preston Booth');
    expect(usernameInput).toHaveValue('prestonxyz');
    expect(nameInput.closest('.cl-field-root')).not.toBeNull();
    expect(usernameInput.closest('.cl-field-root')).not.toBeNull();
    expect(screen.getByText('Name')).toHaveAttribute('for', nameInput.id);
    expect(screen.getByText('Username')).toHaveAttribute('for', usernameInput.id);
    expect(screen.getByText('item1@clerk.dev')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('+1 801-888-8181')).toBeInTheDocument();
    const editProfilePicture = screen.getByRole('button', { name: 'Edit profile picture' });
    expect(editProfilePicture).toHaveAttribute('data-size', 'lg');
    expect(editProfilePicture.querySelector('.cl-avatar')).not.toBeNull();
    expect(screen.queryByRole('tab')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'User Profile' })).toBeNull();
  });

  it('edits the profile picture when the overhanging pen treatment is clicked', async () => {
    const onEditProfilePicture = vi.fn();
    const user = userEvent.setup();
    renderView({ onEditProfilePicture });

    const button = screen.getByRole('button', { name: 'Edit profile picture' });
    const penTreatment = button.querySelector('svg')?.parentElement;
    expect(penTreatment).not.toBeNull();
    await user.click(penTreatment!);

    expect(onEditProfilePicture).toHaveBeenCalledOnce();
  });

  it('renders connected accounts and the danger zone when provided', async () => {
    const onConnectAccount = vi.fn();
    const onManageConnectedAccount = vi.fn();
    const onDeleteAccount = vi.fn();
    const user = userEvent.setup();
    renderView({
      connectedAccounts: [
        { id: 'google', provider: 'Google', identifier: 'test@google.com' },
        { id: 'apple', provider: 'Apple', connected: false },
      ],
      onConnectAccount,
      onManageConnectedAccount,
      onDeleteAccount,
    });

    expect(screen.getByRole('heading', { level: 4, name: 'Connected accounts' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Danger zone' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    await user.click(screen.getByRole('button', { name: 'Connect' }));
    await user.click(screen.getByRole('button', { name: 'Delete account' }));

    expect(onManageConnectedAccount).toHaveBeenCalledWith('google');
    expect(onConnectAccount).toHaveBeenCalledWith('apple');
    expect(onDeleteAccount).toHaveBeenCalledOnce();
  });

  it('renders safely before profile data is available', () => {
    render(
      <MosaicProvider>
        <UserProfileProfilePanelView {...({} as UserProfileProfilePanelViewProps)} />
      </MosaicProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Account' })).toBeInTheDocument();
  });

  it('forwards field and contact actions', async () => {
    const onNameChange = vi.fn();
    const onAddEmail = vi.fn();
    const onManageEmail = vi.fn();
    renderView({ onNameChange, onAddEmail, onManageEmail });
    const user = userEvent.setup();

    await user.type(screen.getByRole('textbox', { name: 'Name' }), ' Jr.');
    await user.click(within(screen.getByRole('region', { name: 'Email' })).getByRole('button', { name: 'Add' }));
    await user.click(screen.getByRole('button', { name: 'Manage item2@clerk.dev' }));

    expect(onNameChange).toHaveBeenCalled();
    expect(onAddEmail).toHaveBeenCalledOnce();
    expect(onManageEmail).toHaveBeenCalledWith('email_2');
  });
});
