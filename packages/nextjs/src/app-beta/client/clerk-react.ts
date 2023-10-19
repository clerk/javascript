// HACK to show app-beta deprecation warning any of the below
// There seems to be some issue when adding the deprecation in the index.ts
import {
  AuthenticateWithRedirectCallback as _AuthenticateWithRedirectCallback,
  ClerkLoaded as _ClerkLoaded,
  ClerkLoading as _ClerkLoading,
  RedirectToCreateOrganization as _RedirectToCreateOrganization,
  RedirectToOrganizationProfile as _RedirectToOrganizationProfile,
  RedirectToSignIn as _RedirectToSignIn,
  RedirectToSignUp as _RedirectToSignUp,
  RedirectToUserProfile as _RedirectToUserProfile,
  SignedIn as _SignedIn,
  SignedOut as _SignedOut,
  useAuth as _useAuth,
  useClerk as _useClerk,
  useEmailLink as _useEmailLink,
  useMagicLink as _useMagicLink,
  useOrganization as _useOrganization,
  useOrganizationList as _useOrganizationList,
  useOrganizations as _useOrganizations,
  useSession as _useSession,
  useSessionList as _useSessionList,
  useSignIn as _useSignIn,
  useSignUp as _useSignUp,
  useUser as _useUser,
} from '@clerk/clerk-react';

/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const useUser = _useUser;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const useAuth = _useAuth;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const useClerk = _useClerk;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const useMagicLink = _useMagicLink;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const useEmailLink = _useEmailLink;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const useOrganization: typeof _useOrganization = _useOrganization;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const useOrganizationList: typeof _useOrganizationList = _useOrganizationList;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const useOrganizations = _useOrganizations;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const useSession = _useSession;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const useSessionList = _useSessionList;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const useSignIn = _useSignIn;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const useSignUp = _useSignUp;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const SignedIn = _SignedIn;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const SignedOut = _SignedOut;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const ClerkLoaded = _ClerkLoaded;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const ClerkLoading = _ClerkLoading;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const RedirectToUserProfile = _RedirectToUserProfile;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const RedirectToSignIn = _RedirectToSignIn;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const RedirectToSignUp = _RedirectToSignUp;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const RedirectToCreateOrganization = _RedirectToCreateOrganization;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const RedirectToOrganizationProfile = _RedirectToOrganizationProfile;
/**
 * @deprecated Use imports from `@clerk/nextjs` instead.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const AuthenticateWithRedirectCallback = _AuthenticateWithRedirectCallback;
