import type { SignUpModalProps, SignUpProps } from '@clerk/shared/types';
import React from 'react';

import { SignUpContext, withCoreSessionSwitchGuard } from '@/contexts';
import type { WithInternalRouting } from '@/internal';
import { Route, VIRTUAL_ROUTER_BASE_PATH } from '@/router';

import { useSignUpRoutesModel } from './sign-up-routes.model';
import { SignUpRoutesView } from './sign-up-routes.view';
import { SignUpContinue } from './SignUpContinue';
import { SignUpProtectCheck } from './SignUpProtectCheck';
import { SignUpSSOCallback } from './SignUpSSOCallback';
import { SignUpStart } from './SignUpStart';
import { SignUpVerifyEmail } from './SignUpVerifyEmail';
import { SignUpVerifyPhone } from './SignUpVerifyPhone';

function SignUpRoutes(): JSX.Element {
  const model = useSignUpRoutesModel();

  return <SignUpRoutesView {...model} />;
}

SignUpRoutes.displayName = 'SignUp';

export const SignUp: React.ComponentType<SignUpProps> = withCoreSessionSwitchGuard(SignUpRoutes);

const InternalSignUp: React.ComponentType<WithInternalRouting<SignUpProps>> = withCoreSessionSwitchGuard(SignUpRoutes);

export const SignUpModal = (props: SignUpModalProps): JSX.Element => {
  const signUpProps = {
    signInUrl: `/${VIRTUAL_ROUTER_BASE_PATH}/sign-in`,
    waitlistUrl: `/${VIRTUAL_ROUTER_BASE_PATH}/waitlist`,
    ...props,
  };

  return (
    <Route path='sign-up'>
      <SignUpContext.Provider
        value={{
          componentName: 'SignUp',
          ...signUpProps,
          routing: 'virtual',
          mode: 'modal',
        }}
      >
        {/*TODO: Used by InvisibleRootBox, can we simplify? */}
        <div>
          <InternalSignUp
            {...signUpProps}
            routing='virtual'
          />
        </div>
      </SignUpContext.Provider>
    </Route>
  );
};

export { SignUpContinue, SignUpProtectCheck, SignUpSSOCallback, SignUpStart, SignUpVerifyEmail, SignUpVerifyPhone };
