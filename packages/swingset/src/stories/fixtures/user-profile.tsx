import { useDestructiveController } from '@clerk/mosaic/blocks/destructive/destructive.controller';
import type { UserProfileViewProps } from '@clerk/mosaic/features/user-profile/user-profile.view';
import type {
  UserProfilePaymentMethod,
  UserProfileSubscription,
} from '@clerk/mosaic/features/user-profile/user-profile-billing-panel.view';
import { UserProfileConnectedAccountsSectionView } from '@clerk/mosaic/features/user-profile/user-profile-connected-accounts-section/user-profile-connected-accounts-section.view';
import { UserProfileDangerSectionView } from '@clerk/mosaic/features/user-profile/user-profile-danger-section/user-profile-danger-section.view';
import { UserProfilePasskeysSectionView } from '@clerk/mosaic/features/user-profile/user-profile-passkeys-section.view';
import { UserProfilePasswordSectionView } from '@clerk/mosaic/features/user-profile/user-profile-password-section/user-profile-password-section.view';
import type {
  UserProfileEmail,
  UserProfilePhone,
} from '@clerk/mosaic/features/user-profile/user-profile-profile-panel.view';
import { UserProfileWeb3WalletsSectionView } from '@clerk/mosaic/features/user-profile/user-profile-web3-wallets-section.view';
import { useRef, useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosEmail, chaosRows, chaosText } from '@/lib/chaos';

import { APIKeysPanelExample, useAPIKeysTableFixture } from './api-keys-table';
import { usePreviewImage } from './use-preview-image';
import { useUserProfileActiveDevicesFixture } from './user-profile-active-devices';
import { createUserProfileAddEmailFixture } from './user-profile-add-email';
import { createUserProfileAddPhoneFixture } from './user-profile-add-phone';
import { useConnectedAccountsFixture } from './user-profile-connected-accounts';
import { useUserProfileEditNameFixture } from './user-profile-edit-name';
import { useUserProfileEditPasswordFixture } from './user-profile-edit-password';
import { useUserProfileEditUsernameFixture } from './user-profile-edit-username';
import { useUserProfileMfaExample } from './user-profile-mfa-example';
import { usePasskeysFixture } from './user-profile-passkeys';
import { useWeb3WalletsFixture } from './user-profile-web3-wallets';

export function UserProfileDangerPreview() {
  const controller = useDestructiveController({ onDelete: () => Promise.resolve() });
  return <UserProfileDangerSectionView {...controller} />;
}

export interface UserProfileFixtureOptions {
  /** Replaces the default OTP flow, e.g. for a custom dialog example. */
  onAddEmail?: () => void;
}

const exampleEmails: UserProfileEmail[] = [
  { id: 'email_1', value: 'preston@clerk.dev', isDefault: true, isVerified: true },
  { id: 'email_2', value: 'preston.booth@gmail.com', isVerified: true },
];

const examplePhones: UserProfilePhone[] = [
  { id: 'phone_1', value: '+1 801-888-8181', isDefault: true, isVerified: true },
];

const exampleSubscription: UserProfileSubscription = {
  planName: 'Basic Plan',
  priceLabel: '$12 / Month',
  totalDueLabel: '$12.00',
  renewsAtLabel: 'Renews Aug 26',
};

const examplePaymentMethods: UserProfilePaymentMethod[] = [
  { id: 'visa', label: 'Visa •••• 0644', expiryLabel: 'Expires 02/2029', isDefault: true },
];

/**
 * Every page of the user profile, backed by local state so the actions on them do something. For
 * stories that need a realistic profile surface without being about it.
 */
export function useUserProfileFixture({ onAddEmail }: UserProfileFixtureOptions = {}) {
  const titleRef = useRef<HTMLDivElement>(null);
  const connections = useConnectedAccountsFixture();
  const wallets = useWeb3WalletsFixture();
  const editName = useUserProfileEditNameFixture();
  const editUsername = useUserProfileEditUsernameFixture();
  const editPassword = useUserProfileEditPasswordFixture();
  const mfa = useUserProfileMfaExample();
  const [activePage, setActivePage] = useState<UserProfileViewProps['activePage']>('account');
  const seedEmails = useChaosFixture(exampleEmails, items =>
    chaosRows(items, 8).map((email, index) => ({ ...email, value: chaosEmail(index), isDefault: index === 0 })),
  );
  const seedPhones = useChaosFixture(examplePhones, items =>
    chaosRows(items, 6).map((phone, index) => ({
      ...phone,
      value: `${phone.value} ext. 1234567890`,
      isDefault: index === 0,
    })),
  );
  const [emails, setEmails] = useState(seedEmails);
  const [phones, setPhones] = useState(seedPhones);
  const passkeys = usePasskeysFixture();
  const activeDevices = useUserProfileActiveDevicesFixture();

  const seedSubscription = useChaosFixture(exampleSubscription, subscription => ({
    planName: chaosText(subscription.planName),
    priceLabel: '$1,234,567.89 / Month',
    totalDueLabel: '$1,234,567.89',
    renewsAtLabel: chaosText(subscription.renewsAtLabel),
  }));
  const seedPaymentMethods = useChaosFixture(examplePaymentMethods, items =>
    chaosRows(items, 8).map((method, index) => ({
      ...method,
      label: chaosText(method.label),
      isDefault: index === 0,
    })),
  );
  const [subscription, setSubscription] = useState<UserProfileSubscription>(seedSubscription);
  const [paymentMethods, setPaymentMethods] = useState<UserProfilePaymentMethod[]>(seedPaymentMethods);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const apiKeys = useAPIKeysTableFixture();
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
      titleRef,
      connectedAccountsSlot: (
        <UserProfileConnectedAccountsSectionView
          {...connections}
          fallbackFocus={() => titleRef.current}
        />
      ),
      web3WalletsSlot: (
        <UserProfileWeb3WalletsSectionView
          {...wallets}
          fallbackFocus={() => titleRef.current}
        />
      ),
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
      dangerSlot: <UserProfileDangerPreview />,
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
      passwordSlot: <UserProfilePasswordSectionView {...editPassword} />,
      passkeysSlot: <UserProfilePasskeysSectionView {...passkeys} />,
      ...mfa.security,
      devices: activeDevices.devices,
      dangerSlot: <UserProfileDangerPreview />,
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
    apiKeys: <APIKeysPanelExample {...apiKeys} />,
  };

  return { activePage, setActivePage, pages, addEmail, devices: activeDevices.devices };
}
