import { SignUpProps } from '@clerk/types';
import React from 'react';
import { VerifyMagicLink } from 'ui/common';
import { SSOCallback } from 'ui/common/SSOCallback';
import { ComponentContext, useCoreClerk, useSignUpContext, withCoreSessionSwitchGuard } from 'ui/contexts';
import { Route, Switch, VIRTUAL_ROUTER_BASE_PATH } from 'ui/router';

import { SignUpStart } from './SignUpStart';
import { SignUpVerifyEmailAddress, SignUpVerifyPhoneNumber } from './SignUpVerify';

function RedirectToSignUp() {
  const { redirectToSignUp } = useCoreClerk();
  React.useEffect(() => {
    void redirectToSignUp();
  }, []);
  return null;
}

function SignUpRoutes(): JSX.Element {
  const signUpContext = useSignUpContext();

  return (
    <Switch>
      <Route path='verify-email-address'>
        <SignUpVerifyEmailAddress />
      </Route>
      <Route path='verify-phone-number'>
        <SignUpVerifyPhoneNumber />
      </Route>
      <Route path='sso-callback'>
        <SSOCallback
          afterSignUpUrl={signUpContext.afterSignUpUrl}
          afterSignInUrl={signUpContext.afterSignInUrl}
          secondFactorUrl={signUpContext.signInUrl + '#/factor-two'}
        />
      </Route>
      <Route path='verify'>
        <VerifyMagicLink redirectUrlComplete={signUpContext.afterSignUpUrl || undefined} />
      </Route>
      <Route index>
        <SignUpStart />
      </Route>
      <Route>
        <RedirectToSignUp />
      </Route>
    </Switch>
  );
}

SignUpRoutes.displayName = 'SignUp';

export const SignUp: React.ComponentType<SignUpProps> = withCoreSessionSwitchGuard(SignUpRoutes);

export const SignUpModal = (props: SignUpProps): JSX.Element => {
  const signUpProps: SignUpProps = {
    signInUrl: `/${VIRTUAL_ROUTER_BASE_PATH}/sign-in`,
    ...props,
  };

  return (
    <Route path='sign-up'>
      <div className='cl-component cl-sign-up'>
        <ComponentContext.Provider
          value={{
            componentName: 'SignUp',
            ...signUpProps,
            routing: 'virtual',
          }}
        >
          <SignUp
            {...signUpProps}
            routing='virtual'
          />
        </ComponentContext.Provider>
      </div>
    </Route>
  );
};
