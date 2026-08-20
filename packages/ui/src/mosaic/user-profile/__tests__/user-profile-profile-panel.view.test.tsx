import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MosaicProvider } from '../../MosaicProvider';
import type { UserProfileProfilePanelViewProps } from '../user-profile-profile-panel.view';
import { UserProfileProfilePanelView } from '../user-profile-profile-panel.view';

const props: UserProfileProfilePanelViewProps = {
  allowMultipleAccounts: true,
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
    renderView({ onEditProfilePicture: vi.fn(), onNameChange: vi.fn(), onUsernameChange: vi.fn() });

    expect(screen.getByRole('heading', { level: 3, name: 'Account' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Account' })).toContainElement(
      document.querySelector('.cl-section-group'),
    );
    expect(screen.getByText('Name')).toHaveClass('cl-section-label');
    expect(screen.getByText('Username')).toHaveClass('cl-section-label');
    expect(screen.getByText('Preston Booth')).toHaveClass('cl-section-description');
    expect(screen.getByText('prestonxyz')).toHaveClass('cl-section-description');
    expect(screen.getByRole('button', { name: 'Edit name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit username' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('item1@clerk.dev')).toBeInTheDocument();
    expect(screen.getByText('item1@clerk.dev').closest('.cl-section-item')).toHaveTextContent('Primary');
    expect(screen.getByText('+1 801-888-8181')).toBeInTheDocument();
    expect(screen.getByText('Profile picture')).toHaveClass('cl-section-label');
    expect(screen.getByText('Recommend size 1:1, up to 10MB.')).toHaveClass('cl-section-description');
    expect(screen.getByText('Email')).toHaveClass('cl-section-label');
    expect(screen.getByText('Phone')).toHaveClass('cl-section-label');
    expect(screen.getByText('item1@clerk.dev').closest('.cl-section-description')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument();
    const profilePicture = screen.getByText('Profile picture').closest('.cl-section-item');
    expect(profilePicture?.querySelector('.cl-section-media')).toHaveAttribute('data-size', 'lg');
    expect(profilePicture?.querySelector('.cl-avatar')).toHaveAttribute('data-size', 'fit');
    expect(screen.queryByRole('tab')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'User Profile' })).toBeNull();
  });

  it('edits the profile picture when Upload is clicked', async () => {
    const onEditProfilePicture = vi.fn();
    const user = userEvent.setup();
    renderView({ onEditProfilePicture });

    await user.click(screen.getByRole('button', { name: 'Upload' }));

    expect(onEditProfilePicture).toHaveBeenCalledOnce();
  });

  it('breaks out both contact types when multiple accounts are allowed', () => {
    renderView({
      emails: [{ id: 'email_1', value: 'item1@clerk.dev', isDefault: true }],
      onAddEmail: vi.fn(),
      onAddPhone: vi.fn(),
    });

    const accountSection = screen.getByRole('region', { name: 'Account' });
    const emailSection = screen.getByRole('region', { name: 'Email' });
    const phoneSection = screen.getByRole('region', { name: 'Phone' });

    expect(accountSection).not.toContainElement(emailSection);
    expect(accountSection).not.toContainElement(phoneSection);
    expect(emailSection).toHaveTextContent('item1@clerk.dev');
    expect(phoneSection).toHaveTextContent('+1 801-888-8181');
    expect(within(emailSection).getByRole('button', { name: 'Add email' })).toHaveTextContent('Add');
    expect(within(phoneSection).getByRole('button', { name: 'Add phone number' })).toHaveTextContent('Add');
  });

  it('keeps both contact types inside Account when multiple accounts are not allowed', () => {
    renderView({
      allowMultipleAccounts: false,
      emails: [{ id: 'email_1', value: 'item1@clerk.dev', isDefault: true }],
      onManageEmail: vi.fn(),
      onManagePhone: vi.fn(),
    });

    const accountSection = screen.getByRole('region', { name: 'Account' });

    expect(accountSection).toHaveTextContent('item1@clerk.dev');
    expect(accountSection).toHaveTextContent('+1 801-888-8181');
    expect(within(accountSection).getByRole('button', { name: 'Update email' })).toBeInTheDocument();
    expect(within(accountSection).getByRole('button', { name: 'Update phone number' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Email' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Phone' })).not.toBeInTheDocument();
  });

  it('forwards inline contact update and add actions', async () => {
    const onAddEmail = vi.fn();
    const onManagePhone = vi.fn();
    const user = userEvent.setup();
    renderView({
      allowMultipleAccounts: false,
      emails: [],
      onAddEmail,
      onManagePhone,
    });

    expect(screen.getByText('No email addresses added')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add email' }));
    await user.click(screen.getByRole('button', { name: 'Update phone number' }));

    expect(onAddEmail).toHaveBeenCalledOnce();
    expect(onManagePhone).toHaveBeenCalledWith('phone_1');
  });

  it('renders an actionable empty state when no phone number exists', () => {
    renderView({ phones: [], onAddPhone: vi.fn() });

    const phoneSection = screen.getByRole('region', { name: 'Phone' });
    const emptyState = within(phoneSection).getByText('No phone numbers added');

    expect(emptyState.closest('.cl-section-items')).not.toBeNull();
    expect(emptyState.closest('.cl-section-item')).not.toContainElement(within(phoneSection).getByText('Phone'));
    expect(within(phoneSection).getByRole('button', { name: 'Add phone number' })).toBeInTheDocument();
  });

  it('renders connected accounts and the danger zone when provided', async () => {
    const onConnectAccount = vi.fn();
    const onManageConnectedAccount = vi.fn();
    const onDeleteAccount = vi.fn();
    const user = userEvent.setup();
    renderView({
      connectedAccounts: [
        { id: 'google', provider: 'Google', identifier: 'test@google.com', iconUrl: 'https://example.com/google.svg' },
        { id: 'apple', provider: 'Apple', connected: false },
      ],
      onConnectAccount,
      onManageConnectedAccount,
      onDeleteAccount,
    });

    expect(screen.getByRole('heading', { level: 4, name: 'Connected accounts' })).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Connected accounts' }).querySelector('.cl-section-media[data-size="lg"] img'),
    ).toHaveAttribute('src', 'https://example.com/google.svg');
    expect(screen.getByRole('heading', { level: 4, name: 'Danger zone' })).toBeInTheDocument();
    expect(screen.getByText('Delete account', { selector: '.cl-section-label' })).toBeInTheDocument();
    expect(screen.getByText('Permanently delete this account and all its data. This cannot be undone.')).toHaveClass(
      'cl-section-description',
    );
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
    const onConnectWeb3Wallet = vi.fn();
    const onSetPrimaryWeb3Wallet = vi.fn();
    const onRemoveWeb3Wallet = vi.fn();
    const user = userEvent.setup();
    renderView({
      web3Wallets: [
        {
          id: 'primary',
          address: '0x1234567890abcdef1234567890abcdef12345678',
          provider: 'MetaMask',
          iconUrl: 'https://example.com/metamask.svg',
          isPrimary: true,
          isVerified: true,
        },
        {
          id: 'secondary',
          address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          provider: 'Coinbase Wallet',
          isVerified: true,
        },
        {
          id: 'disconnected',
          provider: 'Coinbase Wallet',
          connected: false,
        },
      ],
      onConnectWeb3Wallet,
      onSetPrimaryWeb3Wallet,
      onRemoveWeb3Wallet,
    });

    expect(screen.getByRole('heading', { level: 4, name: 'Web3 wallets' })).toBeInTheDocument();
    expect(screen.getByText('MetaMask')).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Web3 wallets' }).querySelector('.cl-section-media[data-size="lg"] img'),
    ).toHaveAttribute('src', 'https://example.com/metamask.svg');
    expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Web3 wallets' })).getByText('Primary')).toBeInTheDocument();

    await user.click(
      within(screen.getByRole('region', { name: 'Web3 wallets' })).getByRole('button', { name: 'Connect' }),
    );
    await user.click(screen.getByRole('button', { name: 'Manage Coinbase Wallet' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    await user.click(screen.getByRole('button', { name: 'Manage Coinbase Wallet' }));
    const removeWallet = screen.getByRole('menuitem', { name: 'Remove wallet' });
    expect(removeWallet).toHaveAttribute('data-color', 'negative');
    await user.click(removeWallet);

    expect(onConnectWeb3Wallet).toHaveBeenCalledWith('disconnected');
    expect(onSetPrimaryWeb3Wallet).toHaveBeenCalledWith('secondary');
    expect(onRemoveWeb3Wallet).toHaveBeenCalledWith('secondary');
  });

  it('shows unverified Web3 wallets without a set-primary action', async () => {
    const user = userEvent.setup();
    renderView({
      web3Wallets: [{ id: 'unverified', provider: 'WalletConnect', address: 'short', isVerified: false }],
      onSetPrimaryWeb3Wallet: vi.fn(),
      onRemoveWeb3Wallet: vi.fn(),
    });

    expect(screen.getByText('short')).toBeInTheDocument();
    expect(screen.getByText('Unverified')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Manage WalletConnect' }));
    expect(screen.queryByRole('menuitem', { name: 'Set as primary' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Remove wallet' })).toBeInTheDocument();
  });

  it('renders safely before profile data is available', () => {
    render(
      <MosaicProvider>
        <UserProfileProfilePanelView {...({} as UserProfileProfilePanelViewProps)} />
      </MosaicProvider>,
    );

    expect(screen.getByRole('region', { name: 'Account' })).toBeInTheDocument();
  });

  it('forwards profile and contact actions', async () => {
    const onNameChange = vi.fn();
    const onAddEmail = vi.fn();
    const onManageEmail = vi.fn();
    renderView({ onNameChange, onAddEmail, onManageEmail });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Edit name' }));
    await user.click(screen.getByRole('button', { name: 'Add email' }));
    await user.click(screen.getByRole('button', { name: 'Manage item2@clerk.dev' }));
    expect(onManageEmail).not.toHaveBeenCalled();
    await user.click(screen.getByRole('menuitem', { name: 'Manage' }));

    expect(onNameChange).toHaveBeenCalledWith('Preston Booth');
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
