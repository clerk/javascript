import React from 'react';

import { Route, Switch, VIRTUAL_ROUTER_BASE_PATH } from 'ui/router';
import {
  ComponentContext,
  useCoreClerk,
  useSignInContext,
  withCoreSessionSwitchGuard,
} from 'ui/contexts';
import { VerifyMagicLink } from 'ui/common';
import { SignInAccountSwitcher } from './SignInAccountSwitcher';
import { SignInFactorTwo } from './SignInFactorTwo';
import { SignInStart } from './SignInStart';
import { SignInProps } from '@clerk/types';
import { SSOCallback } from 'ui/common/SSOCallback';
import { SignInFactorOne } from 'ui/signIn/SignInFactorOne';

function RedirectToSignIn() {
  const { redirectToSignIn } = useCoreClerk();
  React.useEffect(() => {
    void redirectToSignIn();
  }, []);
  return null;
}

function SignInRoutes(): JSX.Element {
  const signInContext = useSignInContext();

  return (
    <Switch>
      <Route path='factor-one'>
        <SignInFactorOne />
      </Route>
      <Route path='factor-two'>
        <SignInFactorTwo />
      </Route>
      <Route path='sso-callback'>
        <SSOCallback
          afterSignInUrl={signInContext.afterSignInUrl}
          afterSignUpUrl={signInContext.afterSignUpUrl}
          secondFactorUrl={'../factor-two'}
        />
      </Route>
      <Route path='choose'>
        <SignInAccountSwitcher />
      </Route>
      <Route path='verify'>
        <VerifyMagicLink
          redirectUrlComplete={signInContext.afterSignInUrl || undefined}
          redirectUrl='../factor-two'
        />
      </Route>
      <Route index>
        <SignInStart />
      </Route>
      <Route>
        <RedirectToSignIn />
      </Route>
    </Switch>
  );
}

SignInRoutes.displayName = 'SignIn';

export const SignIn: React.ComponentType<SignInProps> = withCoreSessionSwitchGuard(
  SignInRoutes,
);

export const SignInModal = (props: SignInProps): JSX.Element => {
  const signInProps = {
    signUpUrl: `/${VIRTUAL_ROUTER_BASE_PATH}/sign-up`,
    ...props,
  };

  return (
    <Route path='sign-in'>
      <div className='cl-component cl-sign-in'>
        <ComponentContext.Provider
          value={{
            componentName: 'SignIn',
            ...signInProps,
            routing: 'virtual',
          }}
        >
          <SignIn {...signInProps} routing='virtual' />
        </ComponentContext.Provider>
      </div>
    </Route>
  );
};
