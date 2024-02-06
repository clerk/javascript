import type {
  AuthenticateWithRedirectParams,
  HandleOAuthCallbackParams,
  HandleSamlCallbackParams,
  LoadedClerk,
} from '@clerk/types';
import type { SetOptional } from 'type-fest';
import type { AnyEventObject } from 'xstate';
import { fromCallback, fromPromise } from 'xstate';

import { SSO_CALLBACK_PATH_ROUTE } from '~/internals/constants';
import { ClerkElementsRuntimeError } from '~/internals/errors/error';
import type { WithClerk, WithParams, WithUnsafeMetadata } from '~/internals/machines/shared.types';
import { ClerkJSNavigationEvent, isClerkJSNavigationEvent } from '~/internals/machines/utils/clerkjs';

type OptionalRedirectParams = 'redirectUrl' | 'redirectUrlComplete';

export type AuthenticateWithRedirectSignInParams = SetOptional<AuthenticateWithRedirectParams, OptionalRedirectParams>;
export type AuthenticateWithRedirectSignUpParams = SetOptional<
  WithUnsafeMetadata<AuthenticateWithRedirectParams>,
  OptionalRedirectParams
>;

export type AuthenticateWithRedirectInput = WithClerk<
  (
    | (WithParams<AuthenticateWithRedirectSignInParams> & { flow: 'signIn' })
    | (WithParams<AuthenticateWithRedirectSignUpParams> & { flow: 'signUp' })
  ) & { basePath: string }
>;

export const redirect = fromPromise<void, AuthenticateWithRedirectInput>(
  async ({ input: { basePath, clerk, flow, params } }) => {
    const path = clerk.buildUrlWithAuth(`${basePath}${SSO_CALLBACK_PATH_ROUTE}`);

    return clerk.client[flow].authenticateWithRedirect({
      redirectUrl: path,
      redirectUrlComplete: path,
      ...params,
    });
  },
);

export type HandleRedirectCallbackParams<T = Required<HandleOAuthCallbackParams | HandleSamlCallbackParams>> = {
  [K in keyof T]: NonNullable<T[K]>;
};

export type HandleRedirectCallbackInput = LoadedClerk;

/**
 * This function hijacks handleRedirectCallback from ClerkJS to handle navigation events
 * from the state machine.
 */
export const handleRedirectCallback = fromCallback<AnyEventObject, HandleRedirectCallbackInput>(
  ({ sendBack, input: clerk }) => {
    const displayConfig = clerk.__unstable__environment?.displayConfig;

    const customNavigate = (to: string) => {
      console.debug('CLERKJS Event:', to);

      if (isClerkJSNavigationEvent(to)) {
        // Handle known redefined navigation events
        sendBack({ type: to });
      } else if (to === displayConfig?.signInUrl) {
        // Handle known non-redefined sign-in navigation events
        sendBack({ type: ClerkJSNavigationEvent.signIn });
      } else if (to === displayConfig?.signUpUrl) {
        // Handle known non-redefined sign-up navigation events
        sendBack({ type: ClerkJSNavigationEvent.signUp });
      } else {
        // Handle unknown navigation events
        sendBack({ type: 'FAILURE', error: new ClerkElementsRuntimeError(`Unknown navigation event: ${to}`) });
      }

      return Promise.resolve();
    };

    // @ts-expect-error - Clerk types are incomplete
    // TODO: Update local Clerk types
    const loadedClerk = clerk.clerkjs as LoadedClerk;

    void loadedClerk.handleRedirectCallback(
      {
        afterSignInUrl: ClerkJSNavigationEvent.complete,
        afterSignOutUrl: ClerkJSNavigationEvent.signIn,
        afterSignUpUrl: ClerkJSNavigationEvent.signUp,
        continueSignUpUrl: ClerkJSNavigationEvent.continue,
        firstFactorUrl: ClerkJSNavigationEvent.signIn,
        redirectUrl: ClerkJSNavigationEvent.generic,
        resetPasswordUrl: ClerkJSNavigationEvent.resetPassword,
        secondFactorUrl: ClerkJSNavigationEvent.signIn,
        verifyEmailAddressUrl: ClerkJSNavigationEvent.verification,
        verifyPhoneNumberUrl: ClerkJSNavigationEvent.verification,
      } satisfies Required<HandleOAuthCallbackParams>,
      customNavigate,
    );

    return () => void 0;
  },
);
