import { createDeferredPromise } from '@clerk/shared/utils';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useDestructiveController } from '../../../blocks/destructive/destructive.controller';
import { MosaicProvider } from '../../../mosaic-provider';
import { UserProfileDangerSectionView } from '../user-profile-danger-section/user-profile-danger-section.view';
import type { UserProfileProfilePanelViewProps } from '../user-profile-profile-panel.view';
import { UserProfileProfilePanelView } from '../user-profile-profile-panel.view';
import { UserProfileWeb3WalletsSectionView } from '../user-profile-web3-wallets-section.view';

function DeleteAccount() {
  const controller = useDestructiveController({ onDelete: () => Promise.resolve() });
  return <UserProfileDangerSectionView {...controller} />;
}

const props: UserProfileProfilePanelViewProps = {
  allowMultipleAccounts: true,
  name: 'Preston Booth',
  username: 'prestonxyz',
  emails: [
    { id: 'email_1', value: 'item1@clerk.dev', isDefault: true, isVerified: true },
    { id: 'email_2', value: 'item2@clerk.dev', isDefault: false, isVerified: true },
  ],
  phones: [{ id: 'phone_1', value: '+1 801-888-8181', isDefault: false, isVerified: true }],
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

const phoneVerifier = { sendCode: () => Promise.resolve(), verifyCode: () => Promise.resolve() };

describe('UserProfileProfilePanelView', () => {
  it('names the connection managing the name, as the section does on its own', () => {
    renderView({ nameManagedBy: { name: 'Okta' }, onSubmitName: undefined });

    expect(screen.getByText('Managed by Okta')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit name' })).not.toBeInTheDocument();
  });

  it('drops the rows the instance does not collect', () => {
    renderView({ username: undefined, emails: undefined, phones: undefined });

    expect(screen.queryByText('Username')).not.toBeInTheDocument();
    expect(screen.queryByText('item1@clerk.dev')).not.toBeInTheDocument();
    expect(screen.queryByText('+1 801-888-8181')).not.toBeInTheDocument();
  });

  it('keeps the final wallet confirmation mounted until removal settles', async () => {
    const user = userEvent.setup();
    const titleRef = createRef<HTMLDivElement>();
    const removal = createDeferredPromise();
    const onRemoveWeb3Wallet = vi.fn(async () => {
      await removal.promise;
    });
    const { rerender } = renderView({
      titleRef,
      web3WalletsSlot: (
        <UserProfileWeb3WalletsSectionView
          wallets={[{ id: 'wallet_1', provider: 'MetaMask', address: '0x1234', isVerified: true }]}
          fallbackFocus={() => titleRef.current}
          onRemove={onRemoveWeb3Wallet}
        />
      ),
    });
    await user.click(screen.getByRole('button', { name: 'Manage MetaMask' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove wallet' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    rerender(
      <MosaicProvider>
        <UserProfileProfilePanelView
          {...props}
          titleRef={titleRef}
          web3WalletsSlot={
            <UserProfileWeb3WalletsSectionView
              wallets={[]}
              fallbackFocus={() => titleRef.current}
              onRemove={onRemoveWeb3Wallet}
            />
          }
        />
      </MosaicProvider>,
    );
    expect(screen.queryByRole('heading', { name: 'Web3 wallets' })).not.toBeInTheDocument();
    expect(screen.getByRole('alertdialog')).toHaveTextContent('0x1234');
    await act(async () => {
      removal.resolve();
      await removal.promise;
    });
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    await waitFor(() => expect(document.activeElement).toHaveTextContent(/^Account$/));
  });

  it.each([false, true])('formats normalized phone numbers with multiple accounts set to %s', allowMultipleAccounts => {
    renderView({
      allowMultipleAccounts,
      phones: [{ id: 'phone_added', value: '+18015558181', isDefault: false, isVerified: true }],
      onRemovePhone: vi.fn(),
    });

    expect(screen.getByText('+1 (801) 555-8181')).toBeInTheDocument();
    if (allowMultipleAccounts) {
      expect(screen.getByRole('button', { name: 'Manage +1 (801) 555-8181' })).toBeInTheDocument();
    }
  });

  it('composes the profile content without profile navigation', () => {
    renderView({
      onProfilePictureChange: vi.fn(() => Promise.resolve()),
      onSubmitName: () => Promise.resolve(),
      onSubmitUsername: () => Promise.resolve(),
    });

    expect(screen.getByRole('heading', { level: 2, name: 'Account' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Account' })).toContainElement(
      screen.getByRole('group', { name: 'Profile' }),
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Profile' })).toHaveClass('cl-section-title');
    expect(screen.getByText('Name', { selector: '.cl-section-label > *' })).toBeInTheDocument();
    expect(screen.getByText('Username', { selector: '.cl-section-label > *' })).toBeInTheDocument();
    expect(screen.getByText('Preston Booth')).toHaveClass('cl-section-description');
    expect(screen.getByText('prestonxyz')).toHaveClass('cl-section-description');
    expect(screen.getByRole('button', { name: 'Edit name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit username' })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('item1@clerk.dev')).toBeInTheDocument();
    expect(screen.getByText('item1@clerk.dev').closest('.cl-section-item')).toHaveTextContent('Primary');
    expect(screen.getByText('+1 (801) 888-8181')).toBeInTheDocument();
    expect(screen.getByText('Profile picture', { selector: '.cl-section-label > *' })).toBeInTheDocument();
    expect(screen.getByText('Recommend size 1:1, up to 10MB.')).toHaveClass('cl-section-description');
    expect(screen.getByRole('heading', { level: 3, name: 'Email' })).toHaveClass('cl-section-title');
    expect(screen.getByRole('heading', { level: 3, name: 'Phone' })).toHaveClass('cl-section-title');
    expect(screen.getByText('item1@clerk.dev').closest('.cl-section-description')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument();
    const profilePicture = screen.getByText('Profile picture').closest('.cl-section-item');
    expect(profilePicture?.querySelector('.cl-section-media')).toHaveAttribute('data-size', 'lg');
    expect(profilePicture?.querySelector('.cl-avatar')).toHaveAttribute('data-size', 'fit');
    expect(screen.queryByRole('tab')).toBeNull();
    expect(screen.queryByRole('heading', { name: 'User Profile' })).toBeNull();
  });

  it('uploads the picked file when no profile picture is set', async () => {
    const onProfilePictureChange = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    const { container } = renderView({
      onProfilePictureChange,
      onRemoveProfilePicture: vi.fn(() => Promise.resolve()),
    });

    expect(screen.queryByRole('button', { name: 'Manage profile picture' })).toBeNull();

    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) {
      throw new Error('File picker not found');
    }
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    await user.upload(input, file);

    expect(onProfilePictureChange).toHaveBeenCalledWith(file);
  });

  it('turns away a file past the size the row advertises', async () => {
    const onProfilePictureChange = vi.fn(() => Promise.resolve());
    const onProfilePictureReject = vi.fn();
    const user = userEvent.setup();
    const { container } = renderView({ onProfilePictureChange, onProfilePictureReject });

    const oversized = new File([new Uint8Array(10 * 1000 * 1000 + 1)], 'big.png', { type: 'image/png' });
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) {
      throw new Error('File picker not found');
    }
    await user.upload(input, oversized);

    expect(onProfilePictureChange).not.toHaveBeenCalled();
    expect(onProfilePictureReject).toHaveBeenCalledWith([{ file: oversized, reason: 'size' }]);
    expect(screen.getByRole('alert')).toHaveTextContent('File size exceeds the maximum limit of 10MB.');
    expect(screen.getByText('Recommend size 1:1, up to 10MB.')).toBeInTheDocument();
  });

  it('clears the rejection once an acceptable file is picked', async () => {
    const user = userEvent.setup();
    const { container } = renderView({ onProfilePictureChange: vi.fn(() => Promise.resolve()) });
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) {
      throw new Error('File picker not found');
    }

    await user.upload(input, new File([new Uint8Array(10 * 1000 * 1000 + 1)], 'big.png', { type: 'image/png' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.upload(input, new File(['small'], 'small.png', { type: 'image/png' }));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('nests both contact types as groups inside Account when multiple accounts are allowed', () => {
    renderView({
      emails: [{ id: 'email_1', value: 'item1@clerk.dev', isDefault: true, isVerified: true }],
      onAddEmail: vi.fn(),
      onCreatePhone: () => Promise.resolve(phoneVerifier),
      getPhoneVerifier: () => phoneVerifier,
    });

    const accountSection = screen.getByRole('region', { name: 'Account' });
    const emailSection = within(accountSection).getByRole('group', { name: 'Email' });
    const phoneSection = within(accountSection).getByRole('group', { name: 'Phone' });

    expect(screen.queryByRole('region', { name: 'Email' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Phone' })).not.toBeInTheDocument();
    expect(within(emailSection).getByRole('heading', { level: 3, name: 'Email' })).toBeInTheDocument();
    expect(emailSection.querySelector('.cl-section-header')).toHaveTextContent('Email');
    expect(within(emailSection).getByRole('list')).toContainElement(screen.getByText('item1@clerk.dev'));
    expect(within(emailSection).getAllByRole('listitem')).toHaveLength(1);
    expect(phoneSection).toHaveTextContent('+1 (801) 888-8181');
    expect(within(emailSection).getByRole('button', { name: 'Add email' })).toHaveTextContent('Add');
    expect(within(phoneSection).getByRole('button', { name: 'Add phone number' })).toHaveTextContent('Add');
  });

  it('keeps both contact types inside Account when multiple accounts are not allowed', () => {
    renderView({
      allowMultipleAccounts: false,
      emails: [{ id: 'email_1', value: 'item1@clerk.dev', isDefault: true, isVerified: true }],
      onManageEmail: vi.fn(),
      onManagePhone: vi.fn(),
    });

    const accountSection = screen.getByRole('region', { name: 'Account' });

    expect(accountSection).toHaveTextContent('item1@clerk.dev');
    expect(accountSection).toHaveTextContent('+1 (801) 888-8181');
    expect(within(accountSection).getByRole('button', { name: 'Update email' })).toBeInTheDocument();
    expect(within(accountSection).getByRole('button', { name: 'Update phone number' })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Email' })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Phone' })).not.toBeInTheDocument();
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
    renderView({
      phones: [],
      onCreatePhone: () => Promise.resolve(phoneVerifier),
      getPhoneVerifier: () => phoneVerifier,
    });

    const phoneSection = screen.getByRole('group', { name: 'Phone' });
    const emptyState = within(phoneSection).getByText('No phone numbers added');

    expect(emptyState.closest('.cl-section-items')).not.toBeNull();
    expect(emptyState.closest('.cl-section-item')).not.toContainElement(within(phoneSection).getByText('Phone'));
    expect(within(phoneSection).getByRole('button', { name: 'Add phone number' })).toBeInTheDocument();
  });

  it('renders the danger zone when provided', () => {
    renderView({
      dangerSlot: <DeleteAccount />,
    });

    expect(screen.getByRole('heading', { level: 3, name: 'Danger zone' })).toBeInTheDocument();
    expect(screen.getByText('Delete account', { selector: '.cl-section-label > *' })).toBeInTheDocument();
    expect(screen.getByText('Permanently delete this account and all its data. This cannot be undone.')).toHaveClass(
      'cl-section-description',
    );
  });

  it('places enterprise accounts before Web3 wallets and the danger zone', () => {
    renderView({
      web3WalletsSlot: (
        <UserProfileWeb3WalletsSectionView
          wallets={[{ id: 'wallet_1', provider: 'MetaMask', address: '0x1234', isVerified: true }]}
        />
      ),
      enterpriseAccountsSlot: <div data-testid='enterprise'>Enterprise accounts</div>,
      dangerSlot: <DeleteAccount />,
    });

    const wallets = screen.getByRole('group', { name: 'Web3 wallets' });
    const enterprise = screen.getByTestId('enterprise');
    const danger = screen.getByRole('heading', { name: 'Danger zone' });
    expect(enterprise.compareDocumentPosition(wallets) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(enterprise.compareDocumentPosition(danger) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders Web3 images inside icon frames', () => {
    const { container } = renderView({
      web3WalletsSlot: (
        <UserProfileWeb3WalletsSectionView
          wallets={[
            { id: 'metamask', provider: 'MetaMask', address: 'test', isVerified: true, iconUrl: '/metamask.svg' },
          ]}
        />
      ),
    });

    const frames = container.querySelectorAll('.cl-icon-frame');
    const images = container.querySelectorAll('img');
    expect(frames).toHaveLength(1);
    expect(screen.queryByRole('img', { name: 'MetaMask' })).not.toBeInTheDocument();
    expect(frames[0]).toContainElement(images[0]);
    frames.forEach(frame => expect(frame.closest('.cl-section-media')).toHaveAttribute('data-size', 'lg'));
  });

  it('composes linked wallets and available providers', () => {
    renderView({
      web3WalletsSlot: (
        <UserProfileWeb3WalletsSectionView
          wallets={[
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
          ]}
          availableProviders={[{ id: 'disconnected', provider: 'Coinbase Wallet' }]}
          onConnect={vi.fn()}
          onSetPrimary={vi.fn()}
          onRemove={vi.fn()}
        />
      ),
    });

    expect(screen.getByRole('heading', { level: 3, name: 'Web3 wallets' })).toBeInTheDocument();
    expect(screen.getByText('MetaMask')).toBeInTheDocument();
    expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
    expect(within(screen.getByRole('group', { name: 'Web3 wallets' })).getByText('Primary')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Connect Coinbase Wallet' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Manage Coinbase Wallet' })).toBeVisible();
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
    const onAddEmail = vi.fn();
    const onRemoveEmail = vi.fn();
    renderView({ onSubmitName: () => Promise.resolve(), onAddEmail, onRemoveEmail });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Add email' }));
    await user.click(screen.getByRole('button', { name: 'Manage item2@clerk.dev' }));
    expect(onRemoveEmail).not.toHaveBeenCalled();
    await user.click(screen.getByRole('menuitem', { name: 'Remove email' }));
    expect(onRemoveEmail).not.toHaveBeenCalled();
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remove' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    // Last: the edit-name dialog is modal, so the rest of the panel goes inert once it opens.
    await user.click(screen.getByRole('button', { name: 'Edit name' }));

    expect(screen.getByRole('dialog', { name: 'Edit name' })).toBeInTheDocument();
    expect(onAddEmail).toHaveBeenCalledOnce();
    expect(onRemoveEmail).toHaveBeenCalledWith('email_2');
  });

  it('drives the edit-name dialog from the section, seeded with the saved name', async () => {
    const onSubmitName = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    renderView({ firstName: 'Preston', lastName: 'Booth', onSubmitName });

    await user.click(screen.getByRole('button', { name: 'Edit name' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit name' });
    expect(within(dialog).getByLabelText('First name')).toHaveValue('Preston');
    expect(within(dialog).getByLabelText('Last name')).toHaveValue('Booth');

    await user.clear(within(dialog).getByLabelText('Last name'));
    await user.type(within(dialog).getByLabelText('Last name'), 'Barton');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(onSubmitName).toHaveBeenCalledWith({ firstName: 'Preston', lastName: 'Barton' });
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit name' })).not.toBeInTheDocument());
  });

  it('drives the edit-username dialog from the section, seeded with the saved username', async () => {
    const onSubmitUsername = vi.fn(() => Promise.resolve());
    const user = userEvent.setup();
    renderView({ username: 'prestonxyz', onSubmitUsername });

    await user.click(screen.getByRole('button', { name: 'Edit username' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit username' });
    expect(within(dialog).getByLabelText('Username')).toHaveValue('prestonxyz');

    await user.clear(within(dialog).getByLabelText('Username'));
    await user.type(within(dialog).getByLabelText('Username'), 'preston');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(onSubmitUsername).toHaveBeenCalledWith('preston');
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit username' })).not.toBeInTheDocument());
  });

  it('matches the existing conditional contact actions', async () => {
    const onVerifyEmail = vi.fn();
    const onSetPrimaryEmail = vi.fn();
    const onRemoveEmail = vi.fn();
    const onVerifyPhone = vi.fn();
    const onSetPrimaryPhone = vi.fn();
    const onRemovePhone = vi.fn();
    const user = userEvent.setup();

    renderView({
      emails: [
        { id: 'email_primary', value: 'primary@clerk.dev', isDefault: true, isVerified: false },
        { id: 'email_secondary', value: 'secondary@clerk.dev', isDefault: false, isVerified: true },
        { id: 'email_unverified', value: 'unverified@clerk.dev', isDefault: false, isVerified: false },
      ],
      phones: [
        { id: 'phone_unverified', value: '+1 801-555-0100', isDefault: false, isVerified: false },
        { id: 'phone_secondary', value: '+1 801-555-0101', isDefault: false, isVerified: true },
      ],
      onVerifyEmail,
      onSetPrimaryEmail,
      onRemoveEmail,
      onVerifyPhone,
      onSetPrimaryPhone,
      onRemovePhone,
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
    expect(onRemoveEmail).not.toHaveBeenCalled();
    await user.click(
      within(screen.getByRole('alertdialog', { name: 'Remove email address?' })).getByRole('button', {
        name: 'Remove',
      }),
    );
    expect(onRemoveEmail).toHaveBeenCalledWith('email_secondary');

    await user.click(screen.getByRole('button', { name: 'Manage unverified@clerk.dev' }));
    await user.click(screen.getByRole('menuitem', { name: 'Verify' }));
    expect(onVerifyEmail).toHaveBeenCalledWith('email_unverified');

    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Verify phone number' }));
    expect(onVerifyPhone).toHaveBeenCalledWith('phone_unverified');

    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0100' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remove phone number' }));
    expect(onRemovePhone).not.toHaveBeenCalled();
    await user.click(
      within(screen.getByRole('alertdialog', { name: 'Remove phone number?' })).getByRole('button', {
        name: 'Remove',
      }),
    );
    expect(onRemovePhone).toHaveBeenCalledWith('phone_unverified');

    await user.click(screen.getByRole('button', { name: 'Manage +1 (801) 555-0101' }));
    await user.click(screen.getByRole('menuitem', { name: 'Set as primary' }));
    expect(onSetPrimaryPhone).toHaveBeenCalledWith('phone_secondary');
  });

  it('hides action triggers when immutable items have no available actions', () => {
    renderView({
      emails: [
        {
          id: 'email_immutable',
          value: 'immutable@clerk.dev',
          isDefault: true,
          isVerified: true,
        },
      ],
      phones: [],
      onVerifyEmail: vi.fn(),
      onSetPrimaryEmail: vi.fn(),
    });

    expect(screen.queryByRole('button', { name: 'Manage immutable@clerk.dev' })).not.toBeInTheDocument();
  });
});
