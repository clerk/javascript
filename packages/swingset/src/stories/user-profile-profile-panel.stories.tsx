import type {
  UserProfileEmail,
  UserProfilePhone,
} from '@clerk/ui/mosaic/features/user-profile/user-profile-profile-panel.view';
import { UserProfileProfilePanelView } from '@clerk/ui/mosaic/features/user-profile/user-profile-profile-panel.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

import { usePreviewImage } from './fixtures/use-preview-image';
import { createUserProfileAddEmailFixture } from './fixtures/user-profile-add-email';
import { createUserProfileAddPhoneFixture } from './fixtures/user-profile-add-phone';
import { useConnectedAccountsFixture } from './fixtures/user-profile-connected-accounts';
import { useUserProfileEditNameFixture } from './fixtures/user-profile-edit-name';
import { useUserProfileEditUsernameFixture } from './fixtures/user-profile-edit-username';
import { useWeb3WalletsFixture } from './fixtures/user-profile-web3-wallets';

const profileImageUrl = 'https://avatars.githubusercontent.com/u/51144033?v=4';

export { default as __source } from './user-profile-profile-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfileProfilePanel',
  label: 'Profile panel',
  navigation: { category: 'Panels' },
  source: 'packages/ui/src/mosaic/features/user-profile/user-profile-profile-panel.view.tsx',
};

export function Default(_args: Record<string, unknown>) {
  const [emails, setEmails] = useState<UserProfileEmail[]>([
    { id: 'email_1', value: 'item1@clerk.dev', isDefault: true, isVerified: true },
    { id: 'email_2', value: 'item2@clerk.dev', isVerified: true },
  ]);
  const [phones, setPhones] = useState<UserProfilePhone[]>([
    { id: 'phone_1', value: '+1 801-888-8181', isDefault: true, isVerified: true },
  ]);
  const { imageUrl, showFile, clearImage } = usePreviewImage(profileImageUrl);
  const connections = useConnectedAccountsFixture();
  const wallets = useWeb3WalletsFixture();
  const editName = useUserProfileEditNameFixture();
  const editUsername = useUserProfileEditUsernameFixture();
  const emailFlow = createUserProfileAddEmailFixture({
    onVerified: value => setEmails(current => [...current, { id: `email_${Date.now()}`, value, isVerified: true }]),
  });

  return (
    <UserProfileProfilePanelView
      {...editName}
      {...editUsername}
      {...emailFlow}
      allowMultipleAccounts
      emails={emails}
      connectedAccounts={connections.accounts}
      availableConnectionProviders={connections.availableProviders}
      onReconnectAccount={connections.onReconnect}
      web3Wallets={wallets.wallets}
      availableWeb3Providers={wallets.availableProviders}
      hasImage={Boolean(imageUrl)}
      imageUrl={imageUrl}
      phones={phones}
      {...createUserProfileAddPhoneFixture({
        onVerified: value => setPhones(current => [...current, { id: `phone_${Date.now()}`, value, isVerified: true }]),
      })}
      onConnectAccount={connections.onConnect}
      onDeleteAccount={() => Promise.resolve()}
      onManageEmail={() => undefined}
      onManagePhone={() => undefined}
      onProfilePictureChange={showFile}
      onRemoveConnectedAccount={connections.onRemove}
      onRemoveProfilePicture={clearImage}
      onRemoveEmail={id => setEmails(current => current.filter(email => email.id !== id))}
      onRemovePhone={id => setPhones(current => current.filter(phone => phone.id !== id))}
      onConnectWeb3Wallet={wallets.onConnect}
      onRemoveWeb3Wallet={wallets.onRemove}
      onSetPrimaryWeb3Wallet={wallets.onSetPrimary}
      onSetPrimaryEmail={id => setEmails(current => current.map(email => ({ ...email, isDefault: email.id === id })))}
      onSetPrimaryPhone={id => setPhones(current => current.map(phone => ({ ...phone, isDefault: phone.id === id })))}
      onVerifyEmail={() => undefined}
      onVerifyPhone={() => undefined}
    />
  );
}
