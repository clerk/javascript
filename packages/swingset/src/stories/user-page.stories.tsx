import type { UserPageViewProps } from '@clerk/ui/mosaic/user-profile/user-page.view';
import { UserPageView } from '@clerk/ui/mosaic/user-profile/user-page.view';
import type { UserProfileAPIKey } from '@clerk/ui/mosaic/user-profile/user-profile-api-keys-panel.view';
import type {
  UserProfilePaymentMethod,
  UserProfileSubscription,
} from '@clerk/ui/mosaic/user-profile/user-profile-billing-panel.view';
import type { UserProfileEmail, UserProfilePhone } from '@clerk/ui/mosaic/user-profile/user-profile-profile-panel.view';
import type {
  UserProfileDevice,
  UserProfileMfaMethod,
  UserProfilePasskey,
} from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import type { UserProfilePanelId } from '@clerk/ui/mosaic/user-profile/user-profile-sidebar';
import { useMemo, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { useBackupCodesDialogStory } from './helpers/use-backup-codes-dialog-story';
import { useDeleteAccountDialogStory } from './helpers/use-delete-account-dialog-story';
import { usePasswordDialogStory } from './helpers/use-password-dialog-story';
import { useSignOutAllDevicesDialogStory } from './helpers/use-sign-out-all-devices-dialog-story';

export { default as __source } from './user-page.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserPage',
  label: 'User page',
  layout: 'wide',
  source: 'packages/ui/src/mosaic/user-profile/user-page.view.tsx',
};

const initialAPIKeys: UserProfileAPIKey[] = [
  {
    id: 'primary',
    name: 'Primary API Key',
    expirationLabel: 'Expires Dec 31, 2027',
    createdAtLabel: 'Jan 05, 2026',
    lastUsedAtLabel: 'Dec 31, 2026',
  },
  {
    id: 'legacy',
    name: 'Legacy API Key',
    expirationLabel: 'Expired Jul 1, 2025',
    createdAtLabel: 'Jul 1, 2024',
    lastUsedAtLabel: 'Jul 1, 2025',
    isExpired: true,
  },
];

export function Default() {
  const { openBackupCodesDialog, backupCodesDialog } = useBackupCodesDialogStory();
  const { openDeleteAccountDialog, deleteAccountDialog } = useDeleteAccountDialogStory();
  const { openPasswordDialog, passwordDialog } = usePasswordDialogStory();
  const [activePanel, setActivePanel] = useState<UserProfilePanelId>('account');
  const [emails, setEmails] = useState<UserProfileEmail[]>([
    { id: 'email_1', value: 'item1@clerk.dev', isDefault: true, isVerified: true },
    { id: 'email_2', value: 'item2@clerk.dev', isVerified: true },
  ]);
  const [phones, setPhones] = useState<UserProfilePhone[]>([
    { id: 'phone_1', value: '+1 801-888-8181', isDefault: true, isVerified: true },
  ]);
  const [passkeys, setPasskeys] = useState<UserProfilePasskey[]>([
    {
      id: 'passkey',
      name: 'Passkey',
      createdAtLabel: 'Created today at 10:12 PM',
      lastUsedAtLabel: 'Last used 1h ago',
    },
  ]);
  const [mfaMethods, setMfaMethods] = useState<UserProfileMfaMethod[]>([
    { id: 'sms', type: 'sms', description: '+1 801-888-8181' },
    { id: 'backup', type: 'backup-codes' },
  ]);
  const [devices, setDevices] = useState<UserProfileDevice[]>([
    {
      id: 'current',
      name: 'Safari on macOS',
      description: 'Salt Lake City, UT, United States',
      type: 'desktop',
      isCurrent: true,
    },
    {
      id: 'mobile',
      name: 'Safari on iOS',
      description: 'Last seen 2 weeks ago · Orem, UT, United States',
      type: 'mobile',
    },
  ]);
  const { openSignOutAllDevicesDialog, signOutAllDevicesDialog } = useSignOutAllDevicesDialogStory({
    onSignOut: () => setDevices(current => current.filter(device => device.isCurrent)),
  });
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
  const [apiKeys, setAPIKeys] = useState(initialAPIKeys);
  const [apiKeysPageSize, setAPIKeysPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const visibleAPIKeys = useMemo(
    () => apiKeys.filter(apiKey => apiKey.name.toLowerCase().includes(searchValue.toLowerCase())),
    [apiKeys, searchValue],
  );

  const panels: UserPageViewProps['panels'] = {
    account: {
      allowMultipleAccounts: true,
      imageUrl: 'https://avatars.githubusercontent.com/u/51144033?v=4',
      name: 'Preston Booth',
      username: 'prestonxyz',
      emails,
      phones,
      onAddEmail: () =>
        setEmails(current => [
          ...current,
          { id: `email_${Date.now()}`, value: `item${current.length + 1}@clerk.dev`, isVerified: true },
        ]),
      onAddPhone: () =>
        setPhones(current => [
          ...current,
          {
            id: `phone_${Date.now()}`,
            value: `+1 801-555-${String(current.length + 1).padStart(4, '0')}`,
            isVerified: true,
          },
        ]),
      onDeleteAccount: openDeleteAccountDialog,
      onEditProfilePicture: () => undefined,
      onManageEmail: () => undefined,
      onManagePhone: () => undefined,
      onNameChange: () => undefined,
      onRemoveEmail: id => setEmails(current => current.filter(email => email.id !== id)),
      onRemovePhone: id => setPhones(current => current.filter(phone => phone.id !== id)),
      onSetPrimaryEmail: id => setEmails(current => current.map(email => ({ ...email, isDefault: email.id === id }))),
      onSetPrimaryPhone: id => setPhones(current => current.map(phone => ({ ...phone, isDefault: phone.id === id }))),
      onUsernameChange: () => undefined,
      onVerifyEmail: id =>
        setEmails(current => current.map(email => (email.id === id ? { ...email, isVerified: true } : email))),
      onVerifyPhone: id =>
        setPhones(current => current.map(phone => (phone.id === id ? { ...phone, isVerified: true } : phone))),
    },
    security: {
      hasPassword: true,
      passkeys,
      mfaMethods,
      devices,
      onAddMfaMethod: type =>
        setMfaMethods(current => {
          const timestamp = Date.now();
          return [
            ...current,
            {
              id: `${type}-${timestamp}`,
              type,
              description: type === 'sms' ? '+1 801-555-0100' : undefined,
            },
            ...(current.some(method => method.type === 'backup-codes')
              ? []
              : [{ id: `backup-${timestamp}`, type: 'backup-codes' as const }]),
          ];
        }),
      onAddPasskey: () =>
        setPasskeys(current => [
          ...current,
          { id: `passkey-${Date.now()}`, name: `Passkey ${current.length + 1}`, createdAtLabel: 'Created just now' },
        ]),
      onChangePassword: openPasswordDialog,
      onDeleteAccount: openDeleteAccountDialog,
      onManageDevice: () => undefined,
      onManagePasskey: () => undefined,
      onRegenerateBackupCodes: openBackupCodesDialog,
      onRemoveMfaMethod: id => setMfaMethods(current => current.filter(method => method.id !== id)),
      onRemovePasskey: id => setPasskeys(current => current.filter(passkey => passkey.id !== id)),
      onSignOutAllOtherDevices: openSignOutAllDevicesDialog,
      onSignOutDevice: id => setDevices(current => current.filter(device => device.id !== id)),
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
    apiKeys: {
      apiKeys: visibleAPIKeys,
      pagination: { page: 1, pageCount: 1, pageSize: apiKeysPageSize },
      searchValue,
      selectedIds,
      onCreate: () =>
        setAPIKeys(current => [
          ...current,
          {
            id: `key-${Date.now()}`,
            name: `API Key ${current.length + 1}`,
            expirationLabel: 'Expires Never',
            createdAtLabel: 'Just now',
            lastUsedAtLabel: 'Never',
          },
        ]),
      onPageSizeChange: setAPIKeysPageSize,
      onRevoke: id => {
        setAPIKeys(current => current.filter(apiKey => apiKey.id !== id));
        setSelectedIds(current => current.filter(selectedId => selectedId !== id));
      },
      onSearchChange: setSearchValue,
      onSelectionChange: setSelectedIds,
    },
  };

  return (
    <>
      <UserPageView
        activePanel={activePanel}
        panels={panels}
        onPanelChange={setActivePanel}
      />
      {passwordDialog}
      {deleteAccountDialog}
      {signOutAllDevicesDialog}
      {backupCodesDialog}
    </>
  );
}
