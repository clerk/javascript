import type { UserProfileEmail, UserProfilePhone } from '@clerk/ui/mosaic/user-profile/user-profile-profile-panel.view';
import { UserProfileProfilePanelView } from '@clerk/ui/mosaic/user-profile/user-profile-profile-panel.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

const providerIconUrl = (provider: string) => `https://img.clerk.com/static/${provider}.svg`;
const profileImageUrl = 'https://avatars.githubusercontent.com/u/51144033?v=4';

export { default as __source } from './user-profile-profile-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileProfilePanel',
  label: 'Profile panel',
  navigation: { category: 'Panels' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-profile-panel.view.tsx',
};

export function Default(_args: Record<string, unknown>) {
  const [emails, setEmails] = useState<UserProfileEmail[]>([
    { id: 'email_1', value: 'item1@clerk.dev', isDefault: true, isVerified: true },
    { id: 'email_2', value: 'item2@clerk.dev', isVerified: true },
  ]);
  const [phones, setPhones] = useState<UserProfilePhone[]>([
    { id: 'phone_1', value: '+1 801-888-8181', isDefault: true, isVerified: true },
  ]);

  return (
    <UserProfileProfilePanelView
      allowMultipleAccounts
      emails={emails}
      connectedAccounts={[
        {
          id: 'google',
          provider: 'Google',
          identifier: 'test@google.com',
          iconUrl: providerIconUrl('google'),
          connected: true,
        },
        { id: 'apple', provider: 'Apple', iconUrl: providerIconUrl('apple'), connected: false },
      ]}
      web3Wallets={[
        {
          id: 'metamask',
          address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          provider: 'MetaMask',
          iconUrl: providerIconUrl('metamask'),
          isPrimary: true,
          isVerified: true,
        },
        {
          id: 'coinbase-wallet',
          provider: 'Coinbase Wallet',
          iconUrl: providerIconUrl('coinbase_wallet'),
          connected: false,
        },
      ]}
      imageUrl={profileImageUrl}
      name='Preston Booth'
      phones={phones}
      username='prestonxyz'
      onAddEmail={() =>
        setEmails(current => [
          ...current,
          { id: `email_${Date.now()}`, value: `item${current.length + 1}@clerk.dev`, isVerified: true },
        ])
      }
      onAddPhone={() =>
        setPhones(current => [
          ...current,
          {
            id: `phone_${Date.now()}`,
            value: `+1 801-555-${String(current.length + 1).padStart(4, '0')}`,
            isVerified: true,
          },
        ])
      }
      onConnectAccount={() => undefined}
      onDeleteAccount={() => Promise.resolve()}
      onEditProfilePicture={() => undefined}
      onManageEmail={() => undefined}
      onManagePhone={() => undefined}
      onRemoveConnectedAccount={() => undefined}
      onRemoveEmail={id => setEmails(current => current.filter(email => email.id !== id))}
      onRemovePhone={id => setPhones(current => current.filter(phone => phone.id !== id))}
      onConnectWeb3Wallet={() => undefined}
      onRemoveWeb3Wallet={() => undefined}
      onSetPrimaryWeb3Wallet={() => undefined}
      onSetPrimaryEmail={() => undefined}
      onSetPrimaryPhone={() => undefined}
      onVerifyEmail={() => undefined}
      onVerifyPhone={() => undefined}
      onNameChange={() => undefined}
      onUsernameChange={() => undefined}
    />
  );
}
