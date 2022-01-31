import React from 'react';
import { Route } from 'ui/router';
import { Account } from './Account';
import { NameRoutes } from 'ui/userProfile/name';
import { UsernameRoutes } from 'ui/userProfile/username';
import { EmailAddressesRoutes } from 'ui/userProfile/emailAdressess';
import { PhoneNumbersRoutes } from 'ui/userProfile/phoneNumbers';
import { ConnectedAccountsRoutes } from 'ui/userProfile/connectedAccounts';

export { Account };

type AccountRoutesProps = {
  standAlone?: boolean;
  index?: boolean;
};

export function AccountRoutes({
  standAlone = false,
  index = false,
}: AccountRoutesProps): JSX.Element {
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
      <ConnectedAccountsRoutes />
    </Route>
  );
}
