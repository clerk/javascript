import React from 'react';
import { Route } from 'ui/router';

import { AddNewPhone } from './AddNewPhone';
import { PhoneDetail } from './PhoneDetail';
import { PhoneList } from './PhoneList';

export { AddNewPhone, PhoneDetail, PhoneList };

export const PhoneNumbersRoutes = (): JSX.Element => {
  return (
    <Route path='phone-numbers'>
      <Route index>
        <PhoneList />
      </Route>
      <Route path=':phone_number_id'>
        <PhoneDetail />
      </Route>
      <Route path='add'>
        <AddNewPhone />
      </Route>
    </Route>
  );
};
