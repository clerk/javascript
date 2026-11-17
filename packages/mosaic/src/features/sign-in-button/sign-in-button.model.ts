import { useClerk } from '@clerk/shared/react';
import type { SignInProps } from '@clerk/shared/types';

import { useGetPortalContainer } from '../../primitives/portal';

export type SignInButtonOptions = Pick<
  SignInProps,
  | 'forceRedirectUrl'
  | 'fallbackRedirectUrl'
  | 'signUpForceRedirectUrl'
  | 'signUpFallbackRedirectUrl'
  | 'initialValues'
  | 'withSignUp'
  | 'oauthFlow'
> & {
  /**
   * Whether the button navigates to the sign-in page or opens sign-in in a modal.
   *
   * @default 'redirect'
   */
  mode?: 'redirect' | 'modal';
};

export type SignInButtonModel = { status: 'loading' } | { status: 'ready'; onSignIn: () => Promise<unknown> | void };

export function useSignInButtonModel({ mode = 'redirect', ...options }: SignInButtonOptions): SignInButtonModel {
  const clerk = useClerk();
  const getContainer = useGetPortalContainer();

  if (!clerk.loaded) {
    return { status: 'loading' };
  }

  return {
    status: 'ready',
    onSignIn:
      mode === 'modal'
        ? () => clerk.openSignIn({ ...options, getContainer })
        : () =>
            clerk.redirectToSignIn({
              signInForceRedirectUrl: options.forceRedirectUrl,
              signInFallbackRedirectUrl: options.fallbackRedirectUrl,
              signUpForceRedirectUrl: options.signUpForceRedirectUrl,
              signUpFallbackRedirectUrl: options.signUpFallbackRedirectUrl,
              initialValues: options.initialValues,
            }),
  };
}
