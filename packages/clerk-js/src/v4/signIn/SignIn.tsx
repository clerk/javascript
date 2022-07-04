import { SignInProps } from '@clerk/types';
import React from 'react';

import { ComponentContext, useCoreClerk, useSignInContext, withCoreSessionSwitchGuard } from '../../ui/contexts';
import { Route, Switch, VIRTUAL_ROUTER_BASE_PATH } from '../../ui/router';
import { SignInEmailLinkFlowComplete } from '../common/EmailLinkCompleteFlowCard';
import { Flow } from '../customizables';
import { SignInAccountSwitcher } from './SignInAccountSwitcher';
import { SignInFactorOne } from './SignInFactorOne';
import { SignInFactorTwo } from './SignInFactorTwo';
import { SignInSSOCallback } from './SignInSSOCallback';
import { SignInStart } from './SignInStart';

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
    <Flow.Root flow='signIn'>
      <Switch>
        <Route path='factor-one'>
          <SignInFactorOne />
        </Route>
        <Route path='factor-two'>
          <SignInFactorTwo />
        </Route>
        <Route path='sso-callback'>
          <SignInSSOCallback
            afterSignInUrl={signInContext.afterSignInUrl}
            afterSignUpUrl={signInContext.afterSignUpUrl}
            redirectUrl={signInContext.redirectUrl}
            secondFactorUrl={'../factor-two'}
          />
        </Route>
        <Route path='choose'>
          <SignInAccountSwitcher />
        </Route>
        <Route path='verify'>
          <SignInEmailLinkFlowComplete
            redirectUrlComplete={signInContext.afterSignInUrl || signInContext.redirectUrl || undefined}
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
    </Flow.Root>
  );
}

SignInRoutes.displayName = 'SignIn';

export const SignIn: React.ComponentType<SignInProps> = withCoreSessionSwitchGuard(SignInRoutes);

export const SignInModal = (props: SignInProps): JSX.Element => {
  const signInProps = {
    signUpUrl: `/${VIRTUAL_ROUTER_BASE_PATH}/sign-up`,
    ...props,
  };

  return (
    <Route path='sign-in'>
      <ComponentContext.Provider
        value={{
          componentName: 'SignIn',
          ...signInProps,
          routing: 'virtual',
        }}
      >
        <SignIn
          {...signInProps}
          routing='virtual'
        />
      </ComponentContext.Provider>
    </Route>
  );
};
