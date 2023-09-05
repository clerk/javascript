import type { SignInProps } from '@clerk/types';
import React from 'react';

import { SignInEmailLinkFlowComplete } from '../../common/EmailLinkCompleteFlowCard';
import { ComponentContext, useCoreClerk, useSignInContext, withCoreSessionSwitchGuard } from '../../contexts';
import { Flow } from '../../customizables';
import { Route, Switch, VIRTUAL_ROUTER_BASE_PATH } from '../../router';
import { ResetPassword } from './ResetPassword';
import { ResetPasswordSuccess } from './ResetPasswordSuccess';
import { SignInAccountSwitcher } from './SignInAccountSwitcher';
import { SignInFactorOne } from './SignInFactorOne';
import { SignInFactorTwo } from './SignInFactorTwo';
import { SignInSSOCallback } from './SignInSSOCallback';
import { SignInStart } from './SignInStart';

function RedirectToSignIn() {
  const clerk = useCoreClerk();
  React.useEffect(() => {
    void clerk.redirectToSignIn();
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
        <Route path='reset-password'>
          <ResetPassword />
        </Route>
        <Route path='reset-password-success'>
          <ResetPasswordSuccess />
        </Route>
        <Route path='sso-callback'>
          <SignInSSOCallback
            afterSignInUrl={signInContext.afterSignInUrl}
            afterSignUpUrl={signInContext.afterSignUpUrl}
            redirectUrl={signInContext.redirectUrl}
            continueSignUpUrl={signInContext.signUpContinueUrl}
            firstFactorUrl={'../factor-one'}
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
