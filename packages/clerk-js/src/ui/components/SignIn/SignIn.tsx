import type { SignInProps } from '@clerk/types';
import React from 'react';

import { SignInEmailLinkFlowComplete } from '../../common/EmailLinkCompleteFlowCard';
import { ComponentContext, useCoreClerk, useSignInContext, withCoreSessionSwitchGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Route, Switch, VIRTUAL_ROUTER_BASE_PATH } from '../../router';
import { SignInAccountSwitcher } from './SignInAccountSwitcher';
import { SignInFactorOne } from './SignInFactorOne';
import { SignInFactorTwo } from './SignInFactorTwo';
import { SignInSaml } from './SignInSaml';
import { SignInSSOCallback } from './SignInSSOCallback';
import { SignInStart } from './SignInStart';

function RedirectToSignIn() {
  // eslint-disable-next-line @typescript-eslint/unbound-method
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
        <Route path='saml'>
          <SignInSaml />
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
        {/*TODO: Used by InvisibleRootBox, can we simplify? */}
        <div>
          <SignIn
            {...signInProps}
            routing='virtual'
          />
        </div>
      </ComponentContext.Provider>
    </Route>
  );
};
