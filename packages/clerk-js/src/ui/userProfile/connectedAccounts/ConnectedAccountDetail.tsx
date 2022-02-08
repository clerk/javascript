import { Avatar } from '@clerk/shared/components/avatar';
import { List } from '@clerk/shared/components/list';
import { TitledCard } from '@clerk/shared/components/titledCard';
import { ExternalAccountResource } from '@clerk/types';
import React from 'react';
import { svgUrl } from 'ui/common/constants';
import { useCoreUser } from 'ui/contexts';
import { useRouter } from 'ui/router';
import { PageHeading } from 'ui/userProfile/pageHeading';

export function ConnectedAccountDetail(): JSX.Element | null {
  const user = useCoreUser();
  const { params } = useRouter();

  let externalAccount: ExternalAccountResource | null = null;

  for (const ea of user.externalAccounts) {
    if (ea.id == params.connected_account_id) {
      externalAccount = ea;
      break;
    }
  }

  if (!externalAccount) {
    return null;
  }

  const avatarRow = (
    <List.Item
      className='cl-list-item'
      key='photo'
      itemTitle='Photo'
      hoverable={false}
      detail={false}
    >
      <Avatar
        className='cl-image'
        profileImageUrl={externalAccount.avatarUrl}
        size={32}
      />
    </List.Item>
  );

  const emailAddressRow = (
    <List.Item
      className='cl-list-item'
      key='email'
      itemTitle='Email'
      hoverable={false}
      detail={false}
    >
      <div>{externalAccount.emailAddress}</div>
    </List.Item>
  );

  return (
    <>
      <PageHeading title='Connected account' backTo='./../' />
      <TitledCard
        title={
          <>
            <img
              alt={externalAccount.providerTitle()}
              src={svgUrl(externalAccount.providerSlug())}
              className='cl-left-icon-wrapper'
            />
            &nbsp; {externalAccount.providerTitle()}
          </>
        }
        subtitle=' '
        className='cl-themed-card'
      >
        <List className='cl-titled-card-list'>
          {avatarRow}
          {emailAddressRow}
        </List>
      </TitledCard>
    </>
  );
}
