import React from 'react';
import { Route } from 'ui/router';

import { FirstName } from './FirstName';
import { LastName } from './LastName';

export { FirstName, LastName };

export function NameRoutes(): JSX.Element {
  return (
    <>
      <Route path='first-name'>
        <FirstName />
      </Route>
      <Route path='last-name'>
        <LastName />
      </Route>
    </>
  );
}
