import React from 'react';
import { Route } from 'ui/router';

import { AddNewEmail } from './AddNewEmail';
import { EmailDetail } from './EmailDetail';
import { EmailList } from './EmailList';

export { AddNewEmail, EmailDetail, EmailList };

export function EmailAddressesRoutes(): JSX.Element {
  return (
    <Route path='email-addresses'>
      <Route index>
        <EmailList />
      </Route>
      <Route path=':email_address_id'>
        <EmailDetail />
      </Route>
      <Route path='add'>
        <AddNewEmail />
      </Route>
    </Route>
  );
}
