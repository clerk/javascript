// Re-export hooks that don't need type overrides
export {
  useClerk,
  useEmailLink,
  useOrganization,
  useOrganizationList,
  useSession,
  useSessionList,
  useUser,
  useReverification,
} from '@clerk/react';

// Import Signal API hooks with explicit type annotations to ensure Core-3 types
import { useSignIn as _useSignIn, useSignUp as _useSignUp } from '@clerk/react';
import type { SignInSignalValue, SignUpSignalValue } from '@clerk/shared/types';

/**
 * Core-3 Signal API hook for sign-in.
 * Returns { signIn, errors, fetchStatus } with SignInFutureResource.
 */
export const useSignIn: () => SignInSignalValue = _useSignIn;

/**
 * Core-3 Signal API hook for sign-up.
 * Returns { signUp, errors, fetchStatus } with SignUpFutureResource.
 */
export const useSignUp: () => SignUpSignalValue = _useSignUp;

// Re-export Signal API types for Core-3
export type {
  SignInSignalValue,
  SignUpSignalValue,
  SignInFutureResource,
  SignUpFutureResource,
  SignInErrors,
  SignUpErrors,
} from '@clerk/shared/types';

export * from './useSignInWithApple';
export * from './useSignInWithGoogle';
export * from './useSSO';
export * from './useOAuth';
export * from './useAuth';
export * from './useNativeSession';
export * from './useNativeAuthEvents';
