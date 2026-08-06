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
    expect(nameInput).toHaveStyle({ width: '10.9375rem', maxWidth: '50%', flexShrink: 0 });
    expect(usernameInput).toHaveStyle({ width: '10.9375rem', maxWidth: '50%', flexShrink: 0 });
    expect(nameInput.closest('.cl-field-root')).not.toBeNull();
    expect(usernameInput.closest('.cl-field-root')).not.toBeNull();
    expect(screen.getByText('Name')).toHaveAttribute('for', nameInput.id);
    expect(screen.getByText('Username')).toHaveAttribute('for', usernameInput.id);
    expect(screen.getByText('item1@clerk.dev')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('+1 801-888-8181')).toBeInTheDocument();
    expect(screen.getByText('Profile picture')).toHaveAttribute('data-color', 'primary');
    expect(screen.getByText('Email')).toHaveAttribute('data-color', 'primary');
    expect(screen.getByText('Phone')).toHaveAttribute('data-color', 'primary');
    expect(screen.getByText('item1@clerk.dev')).toHaveAttribute('data-color', 'primary');
    const editProfilePicture = screen.getByRole('button', { name: 'Edit profile picture' });
    expect(editProfilePicture).toHaveAttribute('data-size', 'lg');
    expect(editProfilePicture).toHaveStyle({ borderWidth: 0, position: 'relative' });
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
    expect(screen.getByText('Delete account', { selector: 'p' })).toHaveAttribute('data-color', 'primary');
    expect(screen.getByText('This action is permanent and irreversible.')).toHaveAttribute('data-color', 'neutral');
    await user.click(screen.getByRole('button', { name: 'Manage Google' }));
    expect(onManageConnectedAccount).not.toHaveBeenCalled();
    await user.click(screen.getByRole('menuitem', { name: 'Manage' }));
    await user.click(screen.getByRole('button', { name: 'Connect' }));
    await user.click(screen.getByRole('button', { name: 'Delete account' }));

    expect(onManageConnectedAccount).toHaveBeenCalledWith('google');
    expect(onConnectAccount).toHaveBeenCalledWith('apple');
    expect(onDeleteAccount).toHaveBeenCalledOnce();
  });

  it('renders Web3 wallets and forwards wallet actions', async () => {
    const onAddWeb3Wallet = vi.fn();
    const onSetPrimaryWeb3Wallet = vi.fn();
    const onRemoveWeb3Wallet = vi.fn();
    const user = userEvent.setup();
    renderView({
      web3Wallets: [
        {
          id: 'primary',
          address: '0x1234567890abcdef1234567890abcdef12345678',
          provider: 'MetaMask',
          isPrimary: true,
          isVerified: true,
        },
        {
          id: 'secondary',
          address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          provider: 'Coinbase Wallet',
          isVerified: true,
        },
      ],
      onAddWeb3Wallet,
      onSetPrimaryWeb3Wallet,
      onRemoveWeb3Wallet,
    });

    expect(screen.getByRole('heading', { level: 4, name: 'Web3 wallets' })).toBeInTheDocument();
    expect(screen.getByText('MetaMask')).toBeInTheDocument();
    expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
    expect(screen.getByText('Primary')).toBeInTheDocument();

    await user.click(within(screen.getByRole('region', { name: 'Web3 wallets' })).getByRole('button', { name: 'Add' }));
    await user.click(screen.getByRole('button', { name: 'Manage Coinbase Wallet' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    await user.click(screen.getByRole('button', { name: 'Manage Coinbase Wallet' }));
    const removeWallet = screen.getByRole('menuitem', { name: 'Remove wallet' });
    expect(removeWallet).toHaveAttribute('data-color', 'negative');
    await user.click(removeWallet);

    expect(onAddWeb3Wallet).toHaveBeenCalledOnce();
    expect(onSetPrimaryWeb3Wallet).toHaveBeenCalledWith('secondary');
    expect(onRemoveWeb3Wallet).toHaveBeenCalledWith('secondary');
  });

  it('shows unverified Web3 wallets without a set-primary action', async () => {
    const user = userEvent.setup();
    renderView({
      web3Wallets: [{ id: 'unverified', address: 'short', isVerified: false }],
      onSetPrimaryWeb3Wallet: vi.fn(),
      onRemoveWeb3Wallet: vi.fn(),
    });

    expect(screen.getByText('short')).toBeInTheDocument();
    expect(screen.getByText('Unverified')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Manage short' }));
    expect(screen.queryByRole('menuitem', { name: 'Set as primary' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Remove wallet' })).toBeInTheDocument();
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
    expect(onManageEmail).not.toHaveBeenCalled();
    await user.click(screen.getByRole('menuitem', { name: 'Manage' }));

    expect(onNameChange).toHaveBeenCalled();
    expect(onAddEmail).toHaveBeenCalledOnce();
    expect(onManageEmail).toHaveBeenCalledWith('email_2');
  });

  it('matches the existing conditional contact and connected-account actions', async () => {
    const onVerifyEmail = vi.fn();
    const onSetPrimaryEmail = vi.fn();
    const onRemoveEmail = vi.fn();
    const onVerifyPhone = vi.fn();
    const onSetPrimaryPhone = vi.fn();
    const onRemovePhone = vi.fn();
    const onRemoveConnectedAccount = vi.fn();
    const user = userEvent.setup();

    renderView({
      emails: [
        { id: 'email_primary', value: 'primary@clerk.dev', isDefault: true, isVerified: false },
        { id: 'email_secondary', value: 'secondary@clerk.dev', isVerified: true },
        { id: 'email_unverified', value: 'unverified@clerk.dev', isVerified: false },
      ],
      phones: [
        { id: 'phone_unverified', value: '+1 801-555-0100', isVerified: false },
        { id: 'phone_secondary', value: '+1 801-555-0101', isVerified: true },
      ],
      connectedAccounts: [{ id: 'github', provider: 'GitHub', identifier: 'prestonxyz' }],
      onVerifyEmail,
      onSetPrimaryEmail,
      onRemoveEmail,
      onVerifyPhone,
      onSetPrimaryPhone,
      onRemovePhone,
      onRemoveConnectedAccount,
    });

    await user.click(screen.getByRole('button', { name: 'Manage primary@clerk.dev' }));
    await user.click(screen.getByRole('menuitem', { name: 'Complete verification' }));
    expect(onVerifyEmail).toHaveBeenCalledWith('email_primary');

    await user.click(screen.getByRole('button', { name: 'Manage secondary@clerk.dev' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    expect(onSetPrimaryEmail).toHaveBeenCalledWith('email_secondary');

    await user.click(screen.getByRole('button', { name: 'Manage secondary@clerk.dev' }));
    const removeEmail = screen.getByRole('menuitem', { name: 'Remove email' });
    expect(removeEmail).toHaveAttribute('data-color', 'negative');
    await user.click(removeEmail);
    expect(onRemoveEmail).toHaveBeenCalledWith('email_secondary');

    await user.click(screen.getByRole('button', { name: 'Manage unverified@clerk.dev' }));
    await user.click(screen.getByRole('menuitem', { name: 'Verify' }));
    expect(onVerifyEmail).toHaveBeenCalledWith('email_unverified');

    await user.click(screen.getByRole('button', { name: 'Manage +1 801-555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Verify phone number' }));
    expect(onVerifyPhone).toHaveBeenCalledWith('phone_unverified');

    await user.click(screen.getByRole('button', { name: 'Manage +1 801-555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove phone number' }));
    expect(onRemovePhone).toHaveBeenCalledWith('phone_unverified');

    await user.click(screen.getByRole('button', { name: 'Manage +1 801-555-0101' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    expect(onSetPrimaryPhone).toHaveBeenCalledWith('phone_secondary');

    await user.click(screen.getByRole('button', { name: 'Manage GitHub' }));
    const removeConnectedAccount = screen.getByRole('menuitem', { name: 'Remove' });
    expect(removeConnectedAccount).toHaveAttribute('data-color', 'negative');
    await user.click(removeConnectedAccount);
    expect(onRemoveConnectedAccount).toHaveBeenCalledWith('github');
  });

  it('hides action triggers when immutable items have no available actions', () => {
    renderView({
      emails: [
        {
          id: 'email_immutable',
          value: 'immutable@clerk.dev',
          isDefault: true,
          isVerified: true,
          canRemove: false,
        },
      ],
      phones: [],
      connectedAccounts: [{ id: 'github', provider: 'GitHub', identifier: 'prestonxyz', canRemove: false }],
      onVerifyEmail: vi.fn(),
      onSetPrimaryEmail: vi.fn(),
      onRemoveEmail: vi.fn(),
      onRemoveConnectedAccount: vi.fn(),
    });

    expect(screen.queryByRole('button', { name: 'Manage immutable@clerk.dev' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Manage GitHub' })).not.toBeInTheDocument();
  });
});
