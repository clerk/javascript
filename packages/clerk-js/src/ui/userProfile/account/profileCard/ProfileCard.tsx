import { List } from '@clerk/shared/components/list';
import { TitledCard } from '@clerk/shared/components/titledCard';
import { ExternalAccountResource } from '@clerk/types';
import React from 'react';
import { svgUrl } from 'ui/common/constants';
import { useCoreUser, useEnvironment } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';

import { AvatarWithUploader } from '../avatarWithUploader';
import { ProfileEmailAddresses } from './ProfileEmailAddresses';
import { ProfilePhoneNumbers } from './ProfilePhoneNumbers';
import { ProfileWeb3Wallets } from './ProfileWeb3Wallets';

export function ProfileCard(): JSX.Element {
  const { userSettings } = useEnvironment();
  const { attributes } = userSettings;
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

  const buildConnectedAccountsRow = () => {
    const verifiedAccounts = user.verifiedExternalAccounts;

    return (
      <List.Item
        className='cl-list-item'
        key='connected-accounts'
        itemTitle='Connected accounts'
        onClick={() => navigate('connected-accounts')}
      >
        {verifiedAccounts.length === 0 ? (
          <div className='cl-empty-list-item'>None</div>
        ) : (
          <div className='cl-list-item-entry'>
            {verifiedAccounts.map((externalAccount: ExternalAccountResource) => (
              <div key={externalAccount.id}>
                <img
                  alt={externalAccount.providerTitle()}
                  src={svgUrl(externalAccount.provider)}
                  className='cl-left-icon-wrapper'
                />

                {externalAccount.username || externalAccount.emailAddress}
              </div>
            ))}
          </div>
        )}
      </List.Item>
    );
  };

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

  const showWebWallet = attributes.web3_wallet.enabled;
  const showUsername = attributes.username.enabled;
  const showEmail = attributes.email_address.enabled;
  const showPhone = attributes.phone_number.enabled;

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
        {buildConnectedAccountsRow()}
        {showWebWallet && <ProfileWeb3Wallets />}
      </List>
    </TitledCard>
  );
}
