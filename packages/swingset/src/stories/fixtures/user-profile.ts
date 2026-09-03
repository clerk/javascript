import type { UserProfileViewProps } from '@clerk/ui/mosaic/user-profile/user-profile.view';
import type { UserProfileEmail, UserProfilePhone } from '@clerk/ui/mosaic/user-profile/user-profile-profile-panel.view';
import type {
  UserProfileDevice,
  UserProfileMfaMethod,
  UserProfilePasskey,
} from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';
import { useState } from 'react';

export interface UserProfileFixtureOptions {
  /** Replaces the default "append an address" behaviour, e.g. to open a real prompt. */
  onAddEmail?: () => void;
}

/**
 * The account and security pages of the user page, backed by local state so the actions on them
 * do something. For stories that need a realistic profile surface without being about it.
 */
export function useUserProfileFixture({ onAddEmail }: UserProfileFixtureOptions = {}) {
  const [activePage, setActivePage] = useState<UserProfileViewProps['activePage']>('account');
  const [emails, setEmails] = useState<UserProfileEmail[]>([
    { id: 'email_1', value: 'preston@clerk.dev', isDefault: true, isVerified: true },
    { id: 'email_2', value: 'preston.booth@gmail.com', isVerified: true },
  ]);
  const [phones, setPhones] = useState<UserProfilePhone[]>([
    { id: 'phone_1', value: '+1 801-888-8181', isDefault: true, isVerified: true },
  ]);
  const [passkeys, setPasskeys] = useState<UserProfilePasskey[]>([
    {
      id: 'passkey',
      name: 'MacBook Pro',
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
    {
      id: 'desktop',
      name: 'Clerk App on macOS',
      description: 'Last seen May 14th, 2026 · San Francisco, CA, United States',
      type: 'desktop',
    },
  ]);

  const addEmail = (value: string) =>
    setEmails(current => [...current, { id: `email_${Date.now()}`, value, isVerified: false }]);

  const pages: UserProfileViewProps['pages'] = {
    account: {
      allowMultipleAccounts: true,
      imageUrl: 'https://avatars.githubusercontent.com/u/51144033?v=4',
      name: 'Preston Booth',
      username: 'prestonxyz',
      emails,
      phones,
      onAddEmail: onAddEmail ?? (() => addEmail(`preston+${emails.length}@clerk.dev`)),
      onAddPhone: () =>
        setPhones(current => [
          ...current,
          {
            id: `phone_${Date.now()}`,
            value: `+1 801-555-${String(current.length + 1).padStart(4, '0')}`,
            isVerified: true,
          },
        ]),
      onDeleteAccount: () => Promise.resolve(),
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
        setMfaMethods(current => [
          ...current,
          { id: `${type}-${Date.now()}`, type, description: type === 'sms' ? '+1 801-555-0100' : undefined },
        ]),
      onAddPasskey: () =>
        setPasskeys(current => [
          ...current,
          { id: `passkey-${Date.now()}`, name: `Passkey ${current.length + 1}`, createdAtLabel: 'Created just now' },
        ]),
      onChangePassword: () => undefined,
      onDeleteAccount: () => Promise.resolve(),
      onManageDevice: () => undefined,
      onManagePasskey: () => undefined,
      onRegenerateBackupCodes: () => undefined,
      onRemoveMfaMethod: id => setMfaMethods(current => current.filter(method => method.id !== id)),
      onRemovePasskey: id => setPasskeys(current => current.filter(passkey => passkey.id !== id)),
      onSignOutAllOtherDevices: () => setDevices(current => current.filter(device => device.isCurrent)),
      onSignOutDevice: id => setDevices(current => current.filter(device => device.id !== id)),
    },
  };

  return { activePage, setActivePage, pages, addEmail, devices };
}
