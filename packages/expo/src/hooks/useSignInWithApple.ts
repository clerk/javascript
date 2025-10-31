import type { SetActive, SignInResource, SignUpResource } from '@clerk/types';

import { errorThrower } from '../utils/errors';

export type StartAppleAuthenticationFlowParams = {
  unsafeMetadata?: SignUpUnsafeMetadata;
};

export type StartAppleAuthenticationFlowReturnType = {
  createdSessionId: string | null;
  setActive?: SetActive;
  signIn?: SignInResource;
  signUp?: SignUpResource;
};

/**
 * Stub for Apple Authentication hook on non-iOS platforms.
 *
 * Native Apple Authentication using expo-apple-authentication is only available on iOS.
 * For web platforms, use the OAuth-based Apple Sign-In flow instead via useSSO.
 *
 * @example
 * ```tsx
 * import { useSSO } from '@clerk/clerk-expo';
 * import { Button } from 'react-native';
 *
 * function AppleSignInButton() {
 *   const { startSSOFlow } = useSSO();
 *
 *   const onPress = async () => {
 *     try {
 *       const { createdSessionId, setActive } = await startSSOFlow({
 *         strategy: 'oauth_apple'
 *       });
 *
 *       if (createdSessionId && setActive) {
 *         await setActive({ session: createdSessionId });
 *       }
 *     } catch (err) {
 *       console.error('Apple Authentication error:', err);
 *     }
 *   };
 *
 *   return <Button title="Sign in with Apple" onPress={onPress} />;
 * }
 * ```
 *
 * @platform iOS - This hook only works on iOS. On other platforms, it will throw an error.
 *
 * @returns An object containing the `startAppleAuthenticationFlow` function that throws an error
 */
export function useSignInWithApple(): {
  startAppleAuthenticationFlow: (
    startAppleAuthenticationFlowParams?: StartAppleAuthenticationFlowParams,
  ) => Promise<StartAppleAuthenticationFlowReturnType>;
} {
  function startAppleAuthenticationFlow(
    _startAppleAuthenticationFlowParams?: StartAppleAuthenticationFlowParams,
  ): Promise<StartAppleAuthenticationFlowReturnType> {
    return errorThrower.throw(
      'Apple Authentication via expo-apple-authentication is only available on iOS. ' +
        'For web and other platforms, please use the OAuth-based flow with useSSO and strategy: "oauth_apple".',
    );
  }

  return {
    startAppleAuthenticationFlow,
  };
}
