import type { UserVerificationModalProps, UserVerificationProps } from '@clerk/types';
import React from 'react';

import { ComponentContext, withCoreSessionSwitchGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Route, Switch } from '../../router';
import { UserVerificationFactorOne } from './UserVerificationFactorOne';
import { UserVerificationFactorTwo } from './UserVerificationFactorTwo';

function UserVerificationRoutes(): JSX.Element {
  return (
    <Flow.Root flow='signIn'>
      <Switch>
        <Route path='factor-two'>
          <UserVerificationFactorOne />
        </Route>
        <Route index>
          <UserVerificationFactorTwo />
        </Route>
      </Switch>
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
