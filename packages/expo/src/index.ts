export {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  useAuth,
  useClerk,
  useEmailLink,
  useOrganization,
  useOrganizationList,
  useSession,
  useSessionList,
  useSignIn,
  useSignUp,
  useUser,
} from '@clerk/clerk-react';

export { isClerkAPIResponseError, isEmailLinkError, isKnownError, isMetamaskError } from '@clerk/clerk-react/errors';

/**
 * @deprecated Use `getClerkInstance()` instead.
 */
export { clerk as Clerk } from './singleton';
export { getClerkInstance } from './singleton';

export * from './ClerkProvider';
export * from './useOAuth';

// Override Clerk React error thrower to show that errors come from @clerk/clerk-expo
import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';

setErrorThrowerOptions({ packageName: PACKAGE_NAME });
