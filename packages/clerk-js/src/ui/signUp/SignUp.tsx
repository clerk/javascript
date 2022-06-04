import { SignUpProps } from '@clerk/types';
import React from 'react';
import { VerifyMagicLink } from 'ui/common';
import { SSOCallback } from 'ui/common/SSOCallback';
import { ComponentContext, useCoreClerk, useSignUpContext, withCoreSessionSwitchGuard } from 'ui/contexts';
import { Route, Switch, VIRTUAL_ROUTER_BASE_PATH } from 'ui/router';

import { SignUpContinue } from './SignUpContinue';
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
          redirectUrl={signUpContext.redirectUrl}
          secondFactorUrl={signUpContext.secondFactorUrl}
          continueSignUpUrl='../continue'
        />
      </Route>
      <Route path='verify'>
        <VerifyMagicLink
          successHeader='Successfully verified email'
          redirectUrlComplete={signUpContext.afterSignUpUrl || signUpContext.redirectUrl || undefined}
          verifyEmailPath='../verify-email-address'
          verifyPhonePath='../verify-phone-number'
        />
      </Route>
      <Route path='continue'>
        <SignUpContinue />
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
