import type { __experimental_UserVerificationModalProps, __experimental_UserVerificationProps } from '@clerk/types';
import React, { useEffect } from 'react';

import { ComponentContext, withCoreSessionSwitchGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Route, Switch } from '../../router';
import { UserVerificationFactorOne } from './UserVerificationFactorOne';
import { UserVerificationFactorTwo } from './UserVerificationFactorTwo';
import { useUserVerificationSession } from './useUserVerificationSession';

function UserVerificationRoutes(): JSX.Element {
  const { invalidate } = useUserVerificationSession();
  useEffect(() => {
    return () => {
      invalidate();
    };
  }, []);
  return (
    <Flow.Root flow='userVerification'>
      <Switch>
        <Route path='factor-two'>
          <UserVerificationFactorTwo />
        </Route>
        <Route index>
          <UserVerificationFactorOne />
        </Route>
      </Switch>
    </Flow.Root>
  );
}

UserVerificationRoutes.displayName = 'UserVerification';

const UserVerification: React.ComponentType<__experimental_UserVerificationProps> =
  withCoreSessionSwitchGuard(UserVerificationRoutes);

const UserVerificationModal = (props: __experimental_UserVerificationModalProps): JSX.Element => {
  return (
    <Route path='user-verification'>
      <ComponentContext.Provider
        value={{
          componentName: 'UserVerification',
          ...props,
          routing: 'virtual',
        }}
      >
        {/*TODO: Used by InvisibleRootBox, can we simplify? */}
        <div>
          <UserVerification
            {...props}
            routing='virtual'
          />
        </div>
      </ComponentContext.Provider>
    </Route>
  );
};

export { UserVerification, UserVerificationModal };
