import { useDestructiveController } from '@clerk/mosaic/blocks/destructive/destructive.controller';
import type { UserProfileViewProps } from '@clerk/mosaic/features/user-profile/user-profile.view';
import { UserProfileActiveDevicesSectionView } from '@clerk/mosaic/features/user-profile/user-profile-active-devices-section/user-profile-active-devices-section.view';
import type {
  UserProfilePaymentMethod,
  UserProfileSubscription,
} from '@clerk/mosaic/features/user-profile/user-profile-billing-panel.view';
import { UserProfileConnectedAccountsSectionView } from '@clerk/mosaic/features/user-profile/user-profile-connected-accounts-section/user-profile-connected-accounts-section.view';
import type {
  UserProfileEmail,
  UserProfilePhone,
} from '@clerk/mosaic/features/user-profile/user-profile-contact.types';
import { UserProfileDangerSectionView } from '@clerk/mosaic/features/user-profile/user-profile-danger-section/user-profile-danger-section.view';
import { UserProfileEmailSectionView } from '@clerk/mosaic/features/user-profile/user-profile-email-section/user-profile-email-section.view';
import { UserProfileMfaSectionView } from '@clerk/mosaic/features/user-profile/user-profile-mfa-section/user-profile-mfa-section.view';
import { UserProfilePasskeysSectionView } from '@clerk/mosaic/features/user-profile/user-profile-passkeys-section.view';
import { UserProfilePasswordSectionView } from '@clerk/mosaic/features/user-profile/user-profile-password-section/user-profile-password-section.view';
import { UserProfilePhoneSectionView } from '@clerk/mosaic/features/user-profile/user-profile-phone-section/user-profile-phone-section.view';
import { UserProfileProfileSectionView } from '@clerk/mosaic/features/user-profile/user-profile-profile-section/user-profile-profile-section.view';
import { UserProfileWeb3WalletsSectionView } from '@clerk/mosaic/features/user-profile/user-profile-web3-wallets-section/user-profile-web3-wallets-section.view';
import { useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosEmail, chaosRows, chaosText } from '@/lib/chaos';

import { APIKeysPanelExample, useAPIKeysTableFixture } from './api-keys-table';
import { useUserProfileActiveDevicesFixture } from './user-profile-active-devices';
import { useConnectedAccountsFixture } from './user-profile-connected-accounts';
import { useUserProfileEditPasswordFixture } from './user-profile-edit-password';
import { useUserProfileEmailsFixture } from './user-profile-emails';
import { useUserProfileMfaExample } from './user-profile-mfa-example';
import { usePasskeysFixture } from './user-profile-passkeys';
import { useUserProfilePhonesFixture } from './user-profile-phones';
import { useUserProfileProfileFixture } from './user-profile-profile';
import { useWeb3WalletsFixture } from './user-profile-web3-wallets';

export function UserProfileDangerPreview() {
  const controller = useDestructiveController({ onDelete: () => Promise.resolve() });
  return <UserProfileDangerSectionView {...controller} />;
}

const exampleEmails: UserProfileEmail[] = [
  { id: 'email_1', value: 'preston@clerk.dev', isDefault: true, isVerified: true },
  { id: 'email_2', value: 'preston.booth@gmail.com', isDefault: false, isVerified: true },
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
export function useUserProfileFixture() {
  const connections = useConnectedAccountsFixture();
  const wallets = useWeb3WalletsFixture();
  const profile = useUserProfileProfileFixture();
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
  const emails = useUserProfileEmailsFixture({
    initialEmails: seedEmails,
    username: profile.username,
  });
  const phones = useUserProfilePhonesFixture({ initialPhones: seedPhones });
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
  const pages: UserProfileViewProps['pages'] = {
    account: {
      children: (
        <>
          <UserProfileProfileSectionView {...profile} />
          <UserProfileEmailSectionView {...emails} />
          <UserProfilePhoneSectionView {...phones} />
          <UserProfileConnectedAccountsSectionView {...connections} />
          <UserProfileWeb3WalletsSectionView {...wallets} />
          <UserProfileDangerPreview />
        </>
      ),
    },
    security: {
      children: (
        <>
          <UserProfilePasswordSectionView {...editPassword} />
          <UserProfilePasskeysSectionView {...passkeys} />
          <UserProfileMfaSectionView {...mfa.section} />
          <UserProfileActiveDevicesSectionView {...activeDevices} />
        </>
      ),
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

  return { activePage, setActivePage, pages, devices: activeDevices.devices };
}
