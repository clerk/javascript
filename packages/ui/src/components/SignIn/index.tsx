import type { SignInModalProps, SignInProps } from '@clerk/shared/types';
import React from 'react';

import { SignInContext, withCoreSessionSwitchGuard } from '@/contexts';
import type { WithInternalRouting } from '@/internal';
import { Route, VIRTUAL_ROUTER_BASE_PATH } from '@/router';

import { useSignInRootController } from './sign-in-root.controller';
import { useSignInRootModel } from './sign-in-root.model';
import { SignInRootView } from './sign-in-root.view';
import { useSignInRoutesController } from './sign-in-routes.controller';
import { useSignInRoutesModel } from './sign-in-routes.model';
import { SignInRoutesView } from './sign-in-routes.view';

function SignInRoutes(): JSX.Element {
  const model = useSignInRoutesModel();
  const controller = useSignInRoutesController(model);
  return <SignInRoutesView {...controller} />;
}

SignInRoutes.displayName = 'SignIn';

function SignInRoot() {
  const model = useSignInRootModel();
  const controller = useSignInRootController(model);
  return (
    <SignInRootView {...controller}>
      <SignInRoutes />
    </SignInRootView>
  );
}

export const SignIn: React.ComponentType<SignInProps> = withCoreSessionSwitchGuard(SignInRoot);

const InternalSignIn: React.ComponentType<WithInternalRouting<SignInProps>> = withCoreSessionSwitchGuard(SignInRoot);

export const SignInModal = (props: SignInModalProps): JSX.Element => {
  const signInProps = {
    signUpUrl: `/${VIRTUAL_ROUTER_BASE_PATH}/sign-up`,
    waitlistUrl: `/${VIRTUAL_ROUTER_BASE_PATH}/waitlist`,
    ...props,
  };

  return (
    <Route path='sign-in'>
      <SignInContext.Provider
        value={{
          componentName: 'SignIn',
          ...signInProps,
          routing: 'virtual',
          mode: 'modal',
        }}
      >
        {/*TODO: Used by InvisibleRootBox, can we simplify? */}
        <div>
          <InternalSignIn
            {...signInProps}
            routing='virtual'
          />
        </div>
      </SignInContext.Provider>
    </Route>
  );
};
