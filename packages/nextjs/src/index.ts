/**
 * These need to be explicitly listed. Do not use an * here.
 * If you do, app router will break.
 */
export {
  AuthenticateWithRedirectCallback,
  ClerkDegraded,
  ClerkFailed,
  ClerkLoaded,
  ClerkLoading,
  RedirectToCreateOrganization,
  RedirectToOrganizationProfile,
  RedirectToSignIn,
  RedirectToSignUp,
  RedirectToTasks,
  RedirectToUserProfile,
  Show,
} from './client-boundary/controlComponents';

/**
 * These need to be explicitly listed. Do not use an * here.
 * If you do, app router will break.
 */
export {
  APIKeys,
  CreateOrganization,
  GoogleOneTap,
  OrganizationList,
  OrganizationProfile,
  OrganizationSwitcher,
  PricingTable,
  SignIn,
  SignInButton,
  SignInWithMetamaskButton,
  SignOutButton,
  SignUp,
  SignUpButton,
  TaskChooseOrganization,
  TaskResetPassword,
  UserAvatar,
  UserButton,
  UserProfile,
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
  useReverification,
  useSession,
  useSessionList,
  useSignIn,
  useSignUp,
  useUser,
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
/**
 * Use `<Protect/>` in RSC (App Router) to restrict access based on authentication and authorization.
 * For client components, use `<Show when={...} />` instead.
 */
export const Protect = ComponentsModule.Protect as ServerComponentsServerModuleTypes['Protect'];
export const SignedIn = ComponentsModule.SignedIn as ServerComponentsServerModuleTypes['SignedIn'];
export const SignedOut = ComponentsModule.SignedOut as ServerComponentsServerModuleTypes['SignedOut'];
