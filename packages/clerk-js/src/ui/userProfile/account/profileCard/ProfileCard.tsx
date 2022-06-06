import { List } from '@clerk/shared/components/list';
import { TitledCard } from '@clerk/shared/components/titledCard';
import React from 'react';
import { useCoreUser, useEnvironment } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';

import { AvatarWithUploader } from '../avatarWithUploader';
import { ProfileEmailAddresses } from './ProfileEmailAddresses';
import { ProfilePhoneNumbers } from './ProfilePhoneNumbers';
import { ProfileSocialAccounts } from './ProfileSocialAccounts';
import { ProfileWeb3Wallets } from './ProfileWeb3Wallets';

export function ProfileCard(): JSX.Element {
  const { userSettings } = useEnvironment();
  const { attributes, social } = userSettings;
  const user = useCoreUser();
  const { navigate } = useNavigate();

  const buildUsernameRow = () => (
    <List.Item
      className='cl-list-item'
      key='user-name'
      itemTitle='Username'
      onClick={() => navigate('username')}
    >
      {user.username}
    </List.Item>
  );

  const avatarRow = (
    <List.Item
      className='cl-list-item'
      key='photo'
      itemTitle='Photo'
      hoverable={false}
      detail={false}
    >
      <AvatarWithUploader
        size={64}
        firstName={user.firstName}
        lastName={user.lastName}
        name={user.fullName}
        profileImageUrl={user.profileImageUrl}
        className='cl-image'
      />
    </List.Item>
  );

  const showUsername = attributes.username.enabled;
  const showEmail = attributes.email_address.enabled;
  const showPhone = attributes.phone_number.enabled;
  const showSocialAccount = social && Object.values(social).filter(p => p.enabled).length > 0;
  const showWebWallet = attributes.web3_wallet.enabled;

  return (
    <TitledCard
      className='cl-themed-card'
      title='Profile'
      subtitle='Manage profile settings'
    >
      <List className='cl-titled-card-list'>
        {avatarRow}
        {showUsername && buildUsernameRow()}
        {showEmail && <ProfileEmailAddresses />}
        {showPhone && <ProfilePhoneNumbers />}
        {showSocialAccount && <ProfileSocialAccounts />}
        {showWebWallet && <ProfileWeb3Wallets />}
      </List>
    </TitledCard>
  );
}
