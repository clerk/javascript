import { useClerk } from '@clerk/shared/react';
import type { SignUpProps } from '@clerk/shared/types';

import { useGetPortalContainer } from '../../primitives/portal';
import type { ClerkCall } from '../clerk/errors';
import { callClerk } from '../clerk/errors';

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

export type SignUpButtonModel = { status: 'loading' } | { status: 'ready'; onSignUp: () => ClerkCall<unknown> };

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
        ? () => callClerk(async () => clerk.openSignUp({ ...options, getContainer }))
        : () =>
            callClerk(() =>
              clerk.redirectToSignUp({
                signUpForceRedirectUrl: options.forceRedirectUrl,
                signUpFallbackRedirectUrl: options.fallbackRedirectUrl,
                signInForceRedirectUrl: options.signInForceRedirectUrl,
                signInFallbackRedirectUrl: options.signInFallbackRedirectUrl,
                initialValues: options.initialValues,
              }),
            ),
  };
}
