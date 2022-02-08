import { List } from '@clerk/shared/components/list';
import { TitledCard } from '@clerk/shared/components/titledCard';
import type { UserResource } from '@clerk/types';
import { ExternalAccountResource } from '@clerk/types';
import React from 'react';
import { svgUrl } from 'ui/common/constants';
import { useCoreUser, useEnvironment } from 'ui/contexts';
import { useNavigate } from 'ui/hooks';

import { AvatarWithUploader } from '../avatarWithUploader';
import { ProfileEmailAddresses } from './ProfileEmailAddresses';
import { ProfilePhoneNumbers } from './ProfilePhoneNumbers';

// Since only Metamask wallet is supported for now, we assume that the user has only
// one Web3 wallet address. When we add support for more wallets, this logic should be
// refactored.
function getWeb3WalletAddress(user: UserResource): string {
  if (user.web3Wallets?.length > 0) {
    return user.web3Wallets[0] ? user.web3Wallets[0].web3Wallet : '';
  }
  return '';
}

export function ProfileCard(): JSX.Element {
  const { authConfig } = useEnvironment();
  const user = useCoreUser();
  const { navigate } = useNavigate();
  const web3Wallet = getWeb3WalletAddress(user);

  const buildWebWalletRow = () => (
    <List.Item
      className='cl-list-item'
      key='web-wallet-name'
      itemTitle='Wallet address'
      detail={false}
    >
      {web3Wallet}
    </List.Item>
  );

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

  const buildConnectedAccountsRow = () => (
    <List.Item
      className='cl-list-item'
      key='connected-accounts'
      itemTitle='Connected accounts'
      onClick={() => navigate('connected-accounts')}
    >
      {user.externalAccounts.length === 0 ? (
        <div className='cl-empty-list-item'>None</div>
      ) : (
        <div className='cl-list-item-entry'>
          {user.externalAccounts.map(
            (externalAccount: ExternalAccountResource) => (
              <div key={externalAccount.id}>
                <img
                  alt={externalAccount.providerTitle()}
                  src={svgUrl(externalAccount.provider)}
                  className='cl-left-icon-wrapper'
                />
                {externalAccount.emailAddress}
              </div>
            ),
          )}
        </div>
      )}
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

  const showWebWallet = !!web3Wallet;
  const showUsername = authConfig.username === 'on';
  const showEmail = authConfig.emailAddress === 'on';
  const showPhone = authConfig.phoneNumber === 'on';

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
        {showWebWallet && buildWebWalletRow()}
      </List>
    </TitledCard>
  );
}
