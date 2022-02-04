import React from 'react';
import { Route } from 'ui/router';

import { Username } from './Username';

export { Username };

export function UsernameRoutes(): JSX.Element {
  return (
    <Route path='username'>
      <Username />
    </Route>
  );
}
