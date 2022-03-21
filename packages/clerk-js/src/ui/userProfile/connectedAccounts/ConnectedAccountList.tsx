import { List } from '@clerk/shared/components/list';
import { TitledCard } from '@clerk/shared/components/titledCard';
import React from 'react';
import { useCoreUser } from 'ui/contexts';
import { PageHeading } from 'ui/userProfile/pageHeading';

import { ConnectedAccountListItem } from './ConnectedAccountListItem';

export function ConnectedAccountList(): JSX.Element {
  const user = useCoreUser();

  const buildExternalAccountRows = () =>
    user.externalAccounts.map(externalAccount => (
      <ConnectedAccountListItem
        key={externalAccount.id}
        externalAccount={externalAccount}
      />
    ));

  return (
    <>
      <PageHeading
        title='Connected accounts'
        backTo='./../'
      />
      <TitledCard className='cl-themed-card cl-list-card'>
        {user.externalAccounts.length > 0 ? (
          <List>{buildExternalAccountRows()}</List>
        ) : (
          <div className='cl-empty-list-item'>You haven't connected any external accounts yet</div>
        )}
      </TitledCard>
    </>
  );
}
