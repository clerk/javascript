import type { __internal_UserVerificationModalProps } from '@clerk/shared/types';

import { UserVerificationContext } from '@/contexts';
import { Flow } from '@/customizables';
import { Route, Switch } from '@/router';

import { UserVerificationFactorOne } from './UserVerificationFactorOne';
import { UserVerificationFactorTwo } from './UserVerificationFactorTwo';

export const UserVerificationRoutesView = (): JSX.Element => (
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

export const UserVerificationModalView = ({
  props,
  userVerification,
}: {
  props: __internal_UserVerificationModalProps;
  userVerification: React.ReactNode;
}): JSX.Element => (
  <Route path='user-verification'>
    <UserVerificationContext.Provider
      value={{
        componentName: 'UserVerification',
        ...props,
        routing: 'virtual',
      }}
    >
      {/*TODO: Used by InvisibleRootBox, can we simplify? */}
      <div>{userVerification}</div>
    </UserVerificationContext.Provider>
  </Route>
);
