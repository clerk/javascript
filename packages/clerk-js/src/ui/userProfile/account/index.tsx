import React from 'react';
import { Route } from 'ui/router';
import { ConnectedAccountsRoutes } from 'ui/userProfile/connectedAccounts';
import { EmailAddressesRoutes } from 'ui/userProfile/emailAdressess';
import { NameRoutes } from 'ui/userProfile/name';
import { PhoneNumbersRoutes } from 'ui/userProfile/phoneNumbers';
import { UsernameRoutes } from 'ui/userProfile/username';
import { Web3WalletsRoutes } from 'ui/userProfile/web3Wallets';

import { Account } from './Account';

export { Account };

type AccountRoutesProps = {
  standAlone?: boolean;
  index?: boolean;
};

export function AccountRoutes({ standAlone = false, index = false }: AccountRoutesProps): JSX.Element {
  return (
    <Route
      path={standAlone ? 'profile' : 'account'}
      index={index || standAlone}
    >
      <Route index>
        <Account />
      </Route>
      <NameRoutes />
      <UsernameRoutes />
      <EmailAddressesRoutes />
      <PhoneNumbersRoutes />
      <Web3WalletsRoutes />
      <ConnectedAccountsRoutes />
    </Route>
  );
}
