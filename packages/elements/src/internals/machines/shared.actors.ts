import type { Clerk, HandleOAuthCallbackParams, HandleSamlCallbackParams, LoadedClerk } from '@clerk/types';
import type { AnyEventObject, EventObject } from 'xstate';
import { fromCallback, fromPromise } from 'xstate';

import { ClerkElementsRuntimeError } from '~/internals/errors';
import { ClerkJSNavigationEvent, isClerkJSNavigationEvent } from '~/internals/machines/utils/clerkjs';

// TODO: Remove
/** @deprecated Use clerkLoader instead */
export const waitForClerk = fromPromise<LoadedClerk, Clerk | LoadedClerk>(({ input: clerk }) => {
  return new Promise((resolve, reject) => {
    if (clerk.loaded) {
      resolve(clerk as LoadedClerk);
    } else if ('addOnLoaded' in clerk) {
      // @ts-expect-error - Expects addOnLoaded from IsomorphicClerk.
      // We don't want internals to rely on the @clerk/clerk-react package
      clerk.addOnLoaded(() => resolve(clerk as LoadedClerk));
    } else {
      reject(new ClerkElementsRuntimeError('Clerk client could not be loaded'));
    }
  });
});

export type ClerkLoaderEvents = { type: 'CLERK.READY' } | { type: 'CLERK.ERROR'; message: string };

export const clerkLoader = fromCallback<EventObject, Clerk | LoadedClerk>(({ sendBack, input: clerk }) => {
  const reportLoaded = () => sendBack({ type: 'CLERK.READY' });

  if (clerk.loaded) {
    reportLoaded();
  } else if ('addOnLoaded' in clerk) {
    // @ts-expect-error - Expects `addOnLoaded` from @clerk/clerk-react's IsomorphicClerk.
    clerk.addOnLoaded(reportLoaded);
  } else {
    sendBack({ type: 'ERROR', message: 'Clerk client could not be loaded' });
  }

  return () => {};
});

export type HandleRedirectCallbackParams<T = Required<HandleOAuthCallbackParams | HandleSamlCallbackParams>> = {
  [K in keyof T]: NonNullable<T[K]>;
};

export type HandleRedirectCallbackInput = LoadedClerk;

// TODO: Remove
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
