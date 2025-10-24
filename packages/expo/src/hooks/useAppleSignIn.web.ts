import type { SetActive, SignInResource, SignUpResource } from '@clerk/types';

import { errorThrower } from '../utils/errors';

export type StartAppleSignInFlowParams = {
  unsafeMetadata?: SignUpUnsafeMetadata;
};

export type StartAppleSignInFlowReturnType = {
  createdSessionId: string | null;
  setActive?: SetActive;
  signIn?: SignInResource;
  signUp?: SignUpResource;
};

/**
 * Web stub for Apple Sign-In hook.
 *
 * Native Apple Sign-In using expo-apple-authentication is not available on web.
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
 *       console.error('Apple Sign-In error:', err);
 *     }
 *   };
 *
 *   return <Button title="Sign in with Apple" onPress={onPress} />;
 * }
 * ```
 *
 * @platform web - This is a web-only stub that throws an error
 *
 * @returns An object containing the `startAppleSignInFlow` function that throws an error
 */
export function useAppleSignIn(): {
  startAppleSignInFlow: (
    startAppleSignInFlowParams?: StartAppleSignInFlowParams,
  ) => Promise<StartAppleSignInFlowReturnType>;
} {
  function startAppleSignInFlow(
    _startAppleSignInFlowParams?: StartAppleSignInFlowParams,
  ): Promise<StartAppleSignInFlowReturnType> {
    return errorThrower.throw(
      'Apple Sign-In via expo-apple-authentication is only available on iOS. ' +
        'For web platforms, please use the OAuth-based flow with useSSO and strategy: "oauth_apple".',
    );
  }

  return {
    startAppleSignInFlow,
  };
}
