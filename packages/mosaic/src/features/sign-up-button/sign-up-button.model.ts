import { useClerk } from '@clerk/shared/react';
import type { SignUpProps } from '@clerk/shared/types';

import { useGetPortalContainer } from '../../primitives/portal';

export type SignUpButtonOptions = Pick<
  SignUpProps,
  | 'forceRedirectUrl'
  | 'fallbackRedirectUrl'
  | 'signInForceRedirectUrl'
  | 'signInFallbackRedirectUrl'
  | 'initialValues'
  | 'unsafeMetadata'
  | 'oauthFlow'
> & {
  /**
   * Whether the button navigates to the sign-up page or opens sign-up in a modal.
   *
   * @default 'redirect'
   */
  mode?: 'redirect' | 'modal';
};

export type SignUpButtonModel = { status: 'loading' } | { status: 'ready'; onSignUp: () => Promise<unknown> | void };

export function useSignUpButtonModel({ mode = 'redirect', ...options }: SignUpButtonOptions): SignUpButtonModel {
  const clerk = useClerk();
  const getContainer = useGetPortalContainer();

  if (!clerk.loaded) {
    return { status: 'loading' };
  }

  return {
    status: 'ready',
    onSignUp:
      mode === 'modal'
        ? () => clerk.openSignUp({ ...options, getContainer })
        : () =>
            clerk.redirectToSignUp({
              signUpForceRedirectUrl: options.forceRedirectUrl,
              signUpFallbackRedirectUrl: options.fallbackRedirectUrl,
              signInForceRedirectUrl: options.signInForceRedirectUrl,
              signInFallbackRedirectUrl: options.signInFallbackRedirectUrl,
              initialValues: options.initialValues,
            }),
  };
}
