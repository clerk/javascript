import type { __internal_UserVerificationModalProps, __internal_UserVerificationProps } from '@clerk/shared/types';
import React, { useEffect } from 'react';

import { UserVerificationContext, withCoreSessionSwitchGuard } from '@/contexts';
import { Flow } from '@/customizables';
import type { WithInternalRouting } from '@/internal';
import { Route, Switch } from '@/router';

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

const UserVerification: React.ComponentType<WithInternalRouting<__internal_UserVerificationProps>> =
  withCoreSessionSwitchGuard(UserVerificationRoutes);

const UserVerificationModal = (props: __internal_UserVerificationModalProps): JSX.Element => {
  return (
    <Route path='user-verification'>
      <UserVerificationContext.Provider
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
      </UserVerificationContext.Provider>
    </Route>
  );
};

export { UserVerification, UserVerificationModal };
