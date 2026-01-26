import { useClerk } from '@clerk/react';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import type { ClientResource, SelectSessionHook } from '@clerk/shared/types';

import { ClerkGoogleOneTapSignIn, isErrorWithCode, isSuccessResponse } from '../google-one-tap';
import { errorThrower } from '../utils/errors';
import type {
  StartGoogleAuthenticationFlowParams,
  StartGoogleAuthenticationFlowReturnType,
} from './useSignInWithGoogle.types';

export type GoogleClientIds = {
  webClientId: string;
  iosClientId?: string;
};

export type GoogleAuthenticationFlowContext = {
  client: ClientResource;
  selectSession: SelectSessionHook;
};

type PlatformConfig = {
  requiresIosClientId: boolean;
};

/**
 * Helper to get Google client IDs from expo-constants or process.env.
 * Dynamically imports expo-constants to keep it optional.
 */
async function getGoogleClientIds(): Promise<{ webClientId?: string; iosClientId?: string }> {
  let webClientId: string | undefined;
  let iosClientId: string | undefined;

  // Try to get values from expo-constants first
  try {
    const ConstantsModule = await import('expo-constants');
    const Constants = ConstantsModule.default as {
      expoConfig?: { extra?: Record<string, string> };
    };
    webClientId =
      Constants?.expoConfig?.extra?.EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID ||
      process.env.EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID;
    iosClientId =
      Constants?.expoConfig?.extra?.EXPO_PUBLIC_CLERK_GOOGLE_IOS_CLIENT_ID ||
      process.env.EXPO_PUBLIC_CLERK_GOOGLE_IOS_CLIENT_ID;
  } catch {
    // expo-constants not available, fall back to process.env only
    webClientId = process.env.EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID;
    iosClientId = process.env.EXPO_PUBLIC_CLERK_GOOGLE_IOS_CLIENT_ID;
  }

  return { webClientId, iosClientId };
}

/**
 * Factory function to create the useSignInWithGoogle hook with platform-specific configuration.
 *
 * @internal
 */
export function createUseSignInWithGoogle(platformConfig: PlatformConfig) {
  return function useSignInWithGoogle() {
    const clerk = useClerk();

    async function startGoogleAuthenticationFlow(
      startGoogleAuthenticationFlowParams?: StartGoogleAuthenticationFlowParams,
    ): Promise<StartGoogleAuthenticationFlowReturnType> {
      const { client, loaded, selectSession } = clerk;

      if (!loaded || !client) {
        return {
          createdSessionId: null,
          selectSession,
        };
      }

      // Get environment variables from expo-constants or process.env
      const { webClientId, iosClientId } = await getGoogleClientIds();

      if (!webClientId) {
        return errorThrower.throw(
          'Google Sign-In credentials not found. Please set EXPO_PUBLIC_CLERK_GOOGLE_WEB_CLIENT_ID in your .env file.',
        );
      }

      if (platformConfig.requiresIosClientId && !iosClientId) {
        return errorThrower.throw(
          'Google Sign-In credentials not found. Please set EXPO_PUBLIC_CLERK_GOOGLE_IOS_CLIENT_ID in your .env file.',
        );
      }

      return executeGoogleAuthenticationFlow(
        { client, selectSession },
        { webClientId, iosClientId },
        startGoogleAuthenticationFlowParams,
      );
    }

    return {
      startGoogleAuthenticationFlow,
    };
  };
}

/**
 * Core implementation of Google Authentication flow shared between iOS and Android.
 *
 * @internal
 */
export async function executeGoogleAuthenticationFlow(
  context: GoogleAuthenticationFlowContext,
  clientIds: GoogleClientIds,
  params?: StartGoogleAuthenticationFlowParams,
): Promise<StartGoogleAuthenticationFlowReturnType> {
  const { client, selectSession } = context;
  const { signIn, signUp } = client;

  // Configure Google Sign-In with client IDs
  ClerkGoogleOneTapSignIn.configure(clientIds);

  // Generate a cryptographic nonce for replay attack protection
  const { randomUUID } = await import('expo-crypto');
  const nonce = randomUUID();

  try {
    // Present Google Sign-In UI with nonce
    const response = await ClerkGoogleOneTapSignIn.presentExplicitSignIn({
      nonce,
    });

    // User cancelled
    if (!isSuccessResponse(response)) {
      return {
        createdSessionId: null,
        selectSession,
        signIn,
        signUp,
      };
    }

    const { idToken } = response.data;

    try {
      // Try to sign in with the Google One Tap strategy
      await signIn.create({
        strategy: 'google_one_tap',
        token: idToken,
      });

      // Check if we need to transfer to SignUp (user doesn't exist yet)
      const userNeedsToBeCreated = signIn.firstFactorVerification.status === 'transferable';

      if (userNeedsToBeCreated) {
        // User doesn't exist - create a new SignUp with transfer
        await signUp.create({
          transfer: true,
          unsafeMetadata: params?.unsafeMetadata,
        });

        return {
          createdSessionId: signUp.createdSessionId,
          selectSession,
          signIn,
          signUp,
        };
      }

      // User exists - return the SignIn session
      return {
        createdSessionId: signIn.createdSessionId,
        selectSession,
        signIn,
        signUp,
      };
    } catch (signInError: unknown) {
      // Handle the case where the user doesn't exist (external_account_not_found)
      if (
        isClerkAPIResponseError(signInError) &&
        signInError.errors?.some(err => err.code === 'external_account_not_found')
      ) {
        // User doesn't exist - create a new SignUp with the token
        await signUp.create({
          strategy: 'google_one_tap',
          token: idToken,
          unsafeMetadata: params?.unsafeMetadata,
        });

        return {
          createdSessionId: signUp.createdSessionId,
          selectSession,
          signIn,
          signUp,
        };
      }

      // Re-throw if it's a different error
      throw signInError;
    }
  } catch (error: unknown) {
    // Handle Google Sign-In cancellation errors
    if (isErrorWithCode(error) && error.code === 'SIGN_IN_CANCELLED') {
      return {
        createdSessionId: null,
        selectSession,
        signIn,
        signUp,
      };
    }

    // Re-throw other errors
    throw error;
  }
}
