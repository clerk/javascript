import { SignUpProps } from '@clerk/types';
import React from 'react';

import { ComponentContext, useCoreClerk, useSignUpContext, withCoreSessionSwitchGuard } from '../../ui/contexts';
import { Route, Switch, VIRTUAL_ROUTER_BASE_PATH } from '../../ui/router';
import { SignUpEmailLinkFlowComplete } from '../common/EmailLinkCompleteFlowCard';
import { SignUpContinue } from './SignUpContinue';
import { SignUpSSOCallback } from './SignUpSSOCallback';
import { SignUpStart } from './SignUpStart';
import { SignUpVerifyEmail } from './SignUpVerifyEmail';
import { SignUpVerifyPhone } from './SignUpVerifyPhone';

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
        <SignUpVerifyEmail />
      </Route>
      <Route path='verify-phone-number'>
        <SignUpVerifyPhone />
      </Route>
      <Route path='sso-callback'>
        <SignUpSSOCallback
          afterSignUpUrl={signUpContext.afterSignUpUrl}
          afterSignInUrl={signUpContext.afterSignInUrl}
          redirectUrl={signUpContext.redirectUrl}
          secondFactorUrl={signUpContext.secondFactorUrl}
          continueSignUpUrl='../continue'
        />
      </Route>
      <Route path='verify'>
        <SignUpEmailLinkFlowComplete
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
