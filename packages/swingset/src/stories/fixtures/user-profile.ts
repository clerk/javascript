import type { UserProfileViewProps } from '@clerk/mosaic/features/user-profile/user-profile.view';
import type {
  UserProfilePaymentMethod,
  UserProfileSubscription,
} from '@clerk/mosaic/features/user-profile/user-profile-billing-panel.view';
import type {
  UserProfileEmail,
  UserProfilePhone,
} from '@clerk/mosaic/features/user-profile/user-profile-profile-panel.view';
import { useState } from 'react';

import { usePreviewImage } from './use-preview-image';
import { useUserProfileActiveDevicesFixture } from './user-profile-active-devices';
import { createUserProfileAddEmailFixture } from './user-profile-add-email';
import { createUserProfileAddPhoneFixture } from './user-profile-add-phone';
import { useUserProfileAPIKeysFixture } from './user-profile-api-keys';
import { useConnectedAccountsFixture } from './user-profile-connected-accounts';
import { useUserProfileEditNameFixture } from './user-profile-edit-name';
import { useUserProfileEditPasswordFixture } from './user-profile-edit-password';
import { useUserProfileEditUsernameFixture } from './user-profile-edit-username';
import { useUserProfileMfaExample } from './user-profile-mfa-example';
import { usePasskeysFixture } from './user-profile-passkeys';
import { useWeb3WalletsFixture } from './user-profile-web3-wallets';

export interface UserProfileFixtureOptions {
  /** Replaces the default OTP flow, e.g. for a custom dialog example. */
  onAddEmail?: () => void;
}

/**
 * Every page of the user profile, backed by local state so the actions on them do something. For
 * stories that need a realistic profile surface without being about it.
 */
export function useUserProfileFixture({ onAddEmail }: UserProfileFixtureOptions = {}) {
  const connections = useConnectedAccountsFixture();
  const wallets = useWeb3WalletsFixture();
  const editName = useUserProfileEditNameFixture();
  const editUsername = useUserProfileEditUsernameFixture();
  const editPassword = useUserProfileEditPasswordFixture();
  const mfa = useUserProfileMfaExample();
  const [activePage, setActivePage] = useState<UserProfileViewProps['activePage']>('account');
  const [emails, setEmails] = useState<UserProfileEmail[]>([
    { id: 'email_1', value: 'preston@clerk.dev', isDefault: true, isVerified: true },
    { id: 'email_2', value: 'preston.booth@gmail.com', isVerified: true },
  ]);
  const [phones, setPhones] = useState<UserProfilePhone[]>([
    { id: 'phone_1', value: '+1 801-888-8181', isDefault: true, isVerified: true },
  ]);
  const passkeys = usePasskeysFixture();
  const activeDevices = useUserProfileActiveDevicesFixture();

  const [subscription, setSubscription] = useState<UserProfileSubscription>({
    planName: 'Basic Plan',
    priceLabel: '$12 / Month',
    totalDueLabel: '$12.00',
    renewsAtLabel: 'Renews Aug 26',
  });
  const [paymentMethods, setPaymentMethods] = useState<UserProfilePaymentMethod[]>([
    { id: 'visa', label: 'Visa •••• 0644', expiryLabel: 'Expires 02/2029', isDefault: true },
  ]);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const apiKeys = useUserProfileAPIKeysFixture();
  const { imageUrl, showFile, clearImage } = usePreviewImage('https://avatars.githubusercontent.com/u/51144033?v=4');
  const addEmail = (value: string) =>
    setEmails(current => [...current, { id: `email_${Date.now()}`, value, isVerified: false }]);
  const emailFlow = createUserProfileAddEmailFixture({
    onVerified: value => setEmails(current => [...current, { id: `email_${Date.now()}`, value, isVerified: true }]),
  });

  const pages: UserProfileViewProps['pages'] = {
    account: {
      ...editName,
      ...editUsername,
      connectedAccounts: connections.accounts,
      availableConnectionProviders: connections.availableProviders,
      onConnectAccount: connections.onConnect,
      onReconnectAccount: connections.onReconnect,
      onRemoveConnectedAccount: connections.onRemove,
      web3Wallets: wallets.wallets,
      availableWeb3Providers: wallets.availableProviders,
      onConnectWeb3Wallet: wallets.onConnect,
      onSetPrimaryWeb3Wallet: wallets.onSetPrimary,
      onRemoveWeb3Wallet: wallets.onRemove,
      allowMultipleAccounts: true,
      hasImage: Boolean(imageUrl),
      imageUrl,
      emails,
      phones,
      onAddEmail,
      onSendEmailCode: onAddEmail ? undefined : emailFlow.onSendEmailCode,
      onVerifyEmailCode: onAddEmail ? undefined : emailFlow.onVerifyEmailCode,
      ...createUserProfileAddPhoneFixture({
        onVerified: value => setPhones(current => [...current, { id: `phone_${Date.now()}`, value, isVerified: true }]),
      }),
      onDeleteAccount: () => Promise.resolve(),
      onManageEmail: () => undefined,
      onManagePhone: () => undefined,
      onProfilePictureChange: showFile,
      onRemoveEmail: id => setEmails(current => current.filter(email => email.id !== id)),
      onRemoveProfilePicture: clearImage,
      onRemovePhone: id => setPhones(current => current.filter(phone => phone.id !== id)),
      onSetPrimaryEmail: id => setEmails(current => current.map(email => ({ ...email, isDefault: email.id === id }))),
      onSetPrimaryPhone: id => setPhones(current => current.map(phone => ({ ...phone, isDefault: phone.id === id }))),
      onVerifyEmail: id =>
        setEmails(current => current.map(email => (email.id === id ? { ...email, isVerified: true } : email))),
      onVerifyPhone: id =>
        setPhones(current => current.map(phone => (phone.id === id ? { ...phone, isVerified: true } : phone))),
    },
    security: {
      ...editPassword,
      passkeys: passkeys.passkeys,
      addPasskeyError: passkeys.addError,
      onRenamePasskey: passkeys.onRename,
      ...mfa.security,
      devices: activeDevices.devices,
      onAddPasskey: passkeys.onAdd,
      onDeleteAccount: () => Promise.resolve(),
      onRemovePasskey: passkeys.onRemove,
      onSignOutAllOtherDevices: activeDevices.onSignOutAllOtherDevices,
      onSignOutDevice: activeDevices.onSignOutDevice,
    },
    billing: {
      subscription,
      paymentMethods,
      historyItems: [
        {
          id: 'stmt_202605_0644',
          dateLabel: 'May 26, 2026',
          invoiceLabel: 'stmt_202605_...us64a',
          amountLabel: '$25.00',
          statusLabel: 'Paid',
        },
      ],
      historyPagination: { page: 1, pageCount: 1, pageSize: historyPageSize },
      onAddPaymentMethod: () =>
        setPaymentMethods(current => [
          ...current,
          { id: `card-${Date.now()}`, label: 'Visa •••• 4242', expiryLabel: 'Expires 08/2030' },
        ]),
      onChangePlan: () =>
        setSubscription(current =>
          current.planName === 'Basic Plan'
            ? {
                planName: 'Pro Plan',
                priceLabel: '$25 / Month',
                totalDueLabel: '$25.00',
                renewsAtLabel: 'Renews Aug 26',
              }
            : {
                planName: 'Basic Plan',
                priceLabel: '$12 / Month',
                totalDueLabel: '$12.00',
                renewsAtLabel: 'Renews Aug 26',
              },
        ),
      onMakeDefaultPaymentMethod: id =>
        setPaymentMethods(current => current.map(method => ({ ...method, isDefault: method.id === id }))),
      onRemovePaymentMethod: id =>
        setPaymentMethods(current => current.filter(paymentMethod => paymentMethod.id !== id)),
      onBillingHistoryPageSizeChange: setHistoryPageSize,
      onViewInvoice: () => undefined,
    },
    apiKeys,
  };

  return { activePage, setActivePage, pages, addEmail, devices: activeDevices.devices };
}
