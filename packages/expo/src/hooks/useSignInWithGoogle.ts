import type { SetActive, SignInResource, SignUpResource } from '@clerk/shared/types';

import { errorThrower } from '../utils/errors';

type SignUpUnsafeMetadata = Record<string, unknown>;

export type StartGoogleAuthenticationFlowParams = {
  unsafeMetadata?: SignUpUnsafeMetadata;
};

export type StartGoogleAuthenticationFlowReturnType = {
  createdSessionId: string | null;
  setActive?: SetActive;
  signIn?: SignInResource;
  signUp?: SignUpResource;
};

/**
 * Stub for Google Authentication hook on unsupported platforms.
 *
 * Native Google Authentication is only available on iOS and Android.
 * For web platforms, use the OAuth-based Google Sign-In flow instead via useSSO.
 *
 * @example
 * ```tsx
 * import { useSSO } from '@clerk/clerk-expo';
 * import { Button } from 'react-native';
 *
 * function GoogleSignInButton() {
 *   const { startSSOFlow } = useSSO();
 *
 *   const onPress = async () => {
 *     try {
 *       const { createdSessionId, setActive } = await startSSOFlow({
 *         strategy: 'oauth_google'
 *       });
 *
 *       if (createdSessionId && setActive) {
 *         await setActive({ session: createdSessionId });
 *       }
 *     } catch (err) {
 *       console.error('Google Authentication error:', err);
 *     }
 *   };
 *
 *   return <Button title="Sign in with Google" onPress={onPress} />;
 * }
 * ```
 *
 * @platform iOS, Android - This hook only works on iOS and Android. On other platforms, it will throw an error.
 *
 * @returns An object containing the `startGoogleAuthenticationFlow` function that throws an error
 */
export function useSignInWithGoogle(): {
  startGoogleAuthenticationFlow: (
    startGoogleAuthenticationFlowParams?: StartGoogleAuthenticationFlowParams,
  ) => Promise<StartGoogleAuthenticationFlowReturnType>;
} {
  function startGoogleAuthenticationFlow(
    _startGoogleAuthenticationFlowParams?: StartGoogleAuthenticationFlowParams,
  ): Promise<StartGoogleAuthenticationFlowReturnType> {
    return errorThrower.throw(
      'Native Google Authentication is only available on iOS and Android. ' +
        'For web and other platforms, please use the OAuth-based flow with useSSO and strategy: "oauth_google".',
    );
  }

  return {
    startGoogleAuthenticationFlow,
  };
}
