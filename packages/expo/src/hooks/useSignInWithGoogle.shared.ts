import { useClerk } from '@clerk/react';
import { isClerkAPIResponseError } from '@clerk/shared/error';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { ClientResource, SetActive } from '@clerk/shared/types';

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
  setActive: SetActive;
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

    clerk.telemetry?.record(eventMethodCalled('useSignInWithGoogle'));

    async function startGoogleAuthenticationFlow(
      startGoogleAuthenticationFlowParams?: StartGoogleAuthenticationFlowParams,
    ): Promise<StartGoogleAuthenticationFlowReturnType> {
      const { client, loaded, setActive } = clerk;

      if (!loaded || !client) {
        return {
          createdSessionId: null,
          setActive,
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
        { client, setActive },
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
  const { client, setActive } = context;
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
        setActive,
        signIn,
        signUp,
      };
    }

    const { idToken, user } = response.data;

    try {
      // Sign up first so a new user's name is recorded; an existing account
      // resolves as transferable below instead of throwing.
      await signUp.create({
        strategy: 'google_one_tap',
        token: idToken,
        firstName: user?.givenName ?? undefined,
        lastName: user?.familyName ?? undefined,
        unsafeMetadata: params?.unsafeMetadata,
      });

      // Check if the account already exists (needs to transfer to SignIn)
      const accountAlreadyExists = signUp.verifications.externalAccount.status === 'transferable';

      if (accountAlreadyExists) {
        // Account exists - transfer to SignIn to complete authentication
        await signIn.create({
          transfer: true,
        });

        return {
          createdSessionId: signIn.createdSessionId,
          setActive,
          signIn,
          signUp,
        };
      }

      // New user - the SignUp completed with the name attached
      return {
        createdSessionId: signUp.createdSessionId,
        setActive,
        signIn,
        signUp,
      };
    } catch (signUpError: unknown) {
      // Handle the case where the account already exists (external_account_exists)
      if (
        isClerkAPIResponseError(signUpError) &&
        signUpError.errors?.some(err => err.code === 'external_account_exists')
      ) {
        // Account exists - sign in with the token directly
        await signIn.create({
          strategy: 'google_one_tap',
          token: idToken,
        });

        return {
          createdSessionId: signIn.createdSessionId,
          setActive,
          signIn,
          signUp,
        };
      }

      // Re-throw if it's a different error
      throw signUpError;
    }
  } catch (error: unknown) {
    // Handle Google Sign-In cancellation errors
    if (isErrorWithCode(error) && error.code === 'SIGN_IN_CANCELLED') {
      return {
        createdSessionId: null,
        setActive,
        signIn,
        signUp,
      };
    }

    // Re-throw other errors
    throw error;
  }
}
