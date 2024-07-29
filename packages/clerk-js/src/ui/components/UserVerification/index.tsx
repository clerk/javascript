import type { UserVerificationModalProps, UserVerificationProps } from '@clerk/types';
import React from 'react';

import { ComponentContext, withCoreSessionSwitchGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Route, Switch } from '../../router';
import { UserVerificationFactorOne } from './UserVerificationFactorOne';
import { UserVerificationFactorTwo } from './UserVerificationFactorTwo';
import { withUserVerificationSession } from './useUserVerificationSession';

function UserVerificationRoutesInner(): JSX.Element {
  return (
    <Switch>
      <Route path='factor-two'>
        <UserVerificationFactorTwo />
      </Route>
      <Route index>
        <UserVerificationFactorOne />
      </Route>
    </Switch>
  );
}

const UserVerificationInner: React.ComponentType = withUserVerificationSession(UserVerificationRoutesInner);

function UserVerificationRoutes(): JSX.Element {
  return (
    <Flow.Root flow='userVerification'>
      <UserVerificationInner />
    </Flow.Root>
  );
}

UserVerificationRoutes.displayName = 'UserVerification';

const UserVerification: React.ComponentType<UserVerificationProps> = withCoreSessionSwitchGuard(UserVerificationRoutes);

const UserVerificationModal = (props: UserVerificationModalProps): JSX.Element => {
  console.log('aaa', props);
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
