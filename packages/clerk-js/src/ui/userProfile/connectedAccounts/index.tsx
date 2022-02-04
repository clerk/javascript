import React from 'react';
import { Route } from 'ui/router';

import { ConnectedAccountDetail } from './ConnectedAccountDetail';
import { ConnectedAccountList } from './ConnectedAccountList';

export { ConnectedAccountList, ConnectedAccountDetail };

export const ConnectedAccountsRoutes = (): JSX.Element => {
  return (
    <Route path='connected-accounts'>
      <Route index>
        <ConnectedAccountList />
      </Route>
      <Route path=':connected_account_id'>
        <ConnectedAccountDetail />
      </Route>
      {/* <Route path='add'> */}
      {/*<AddVerifiableField*/}
      {/*  label="Email address"*/}
      {/*  shortLabel="Email"*/}
      {/*  slug="email_address"*/}
      {/*  copy="We will send you an email with a secret code to verify your email address."*/}
      {/*  onAdd={(value: string) => user.createEmailAddress(value)}*/}
      {/*/>*/}
      {/* </Route> */}
    </Route>
  );
};
