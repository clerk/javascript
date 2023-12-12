export {
  ClerkLoaded,
  ClerkLoading,
  EmailLinkErrorCode,
  MultisessionAppSupport,
  SignedIn,
  SignedOut,
  WithClerk,
  WithSession,
  WithUser,
  isClerkAPIResponseError,
  isEmailLinkError,
  isKnownError,
  isMetamaskError,
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
  withClerk,
  withSession,
  withUser,
} from '@clerk/clerk-react';

export { clerk as Clerk } from './singleton';

export * from './ClerkProvider';
export * from './useOAuth';

// Override Clerk React error thrower to show that errors come from @clerk/clerk-expo
import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';
setErrorThrowerOptions({ packageName: PACKAGE_NAME });
