/**
 * These need to be explicitly listed. Do not use an * here.
 * If you do, app router will break.
 */
export {
  AuthenticateWithRedirectCallback,
  ClerkLoaded,
  ClerkLoading,
  RedirectToCreateOrganization,
  RedirectToOrganizationProfile,
  RedirectToSignIn,
  RedirectToSignUp,
  RedirectToUserProfile,
} from './client-boundary/controlComponents';

/**
 * These need to be explicitly listed. Do not use an * here.
 * If you do, app router will break.
 */
export {
  CreateOrganization,
  OrganizationList,
  OrganizationProfile,
  OrganizationSwitcher,
  SignIn,
  SignInButton,
  SignInWithMetamaskButton,
  SignOutButton,
  SignUp,
  SignUpButton,
  UserButton,
  UserProfile,
  GoogleOneTap,
  Waitlist,
} from './client-boundary/uiComponents';

/**
 * These need to be explicitly listed. Do not use an * here.
 * If you do, app router will break.
 */
export {
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
  __experimental_useReverification,
} from './client-boundary/hooks';

/**
 * Conditionally export components that exhibit different behavior
 * when used in /app vs /pages.
 * We defined the runtime and the type values explicitly,
 * because TS will not recognize the subpath import unless the HOST
 * application sets moduleResolution to 'NodeNext'.
 */
// @ts-ignore
import * as ComponentsModule from '#components';

import type { ServerComponentsServerModuleTypes } from './components.server';

export const ClerkProvider = ComponentsModule.ClerkProvider as ServerComponentsServerModuleTypes['ClerkProvider'];
export const SignedIn = ComponentsModule.SignedIn as ServerComponentsServerModuleTypes['SignedIn'];
export const SignedOut = ComponentsModule.SignedOut as ServerComponentsServerModuleTypes['SignedOut'];
export const Protect = ComponentsModule.Protect as ServerComponentsServerModuleTypes['Protect'];
