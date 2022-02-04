import React from 'react';
import { useEnvironment } from 'ui/contexts';
import { Route } from 'ui/router';
import { AddNewPhone } from 'ui/userProfile/phoneNumbers/AddNewPhone';

import { AddPhone } from './AddPhone';
import { ChangePassword } from './ChangePassword';
import { Security } from './Security';
import { TwoStepVerification } from './TwoStepVerification';

export { AddPhone, ChangePassword, TwoStepVerification, Security };

type SecurityRoutesProps = {
  standAlone?: boolean;
  index?: boolean;
};

export function SecurityRoutes({
  standAlone = false,
  index = false,
}: SecurityRoutesProps): JSX.Element {
  const { authConfig } = useEnvironment();
  const canActivate2svRoutes = () =>
    authConfig.secondFactors.length > 0 &&
    authConfig.secondFactors.includes('phone_code');

  return (
    <Route
      path={standAlone ? 'profile' : 'security'}
      index={index || standAlone}
    >
      <Route index>
        <Security />
      </Route>
      <Route
        canActivate={canActivate2svRoutes}
        fallbackPath={'../'}
        path='two-step'
      >
        <Route index>
          <TwoStepVerification />
        </Route>
        <Route path='add-phone'>
          <Route index>
            <AddPhone standAlone={standAlone} />
          </Route>
          <Route path='new'>
            <AddNewPhone />
          </Route>
        </Route>
      </Route>
      <Route path='password'>
        <ChangePassword />
      </Route>
    </Route>
  );
}
