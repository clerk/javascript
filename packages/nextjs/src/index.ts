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
  UNSAFE_PortalProvider,
  RedirectToCreateOrganization,
  RedirectToOrganizationProfile,
  RedirectToSignIn,
  RedirectToSignUp,
  RedirectToTasks,
  RedirectToUserProfile,
} from './client-boundary/controlComponents';

/**
 * These need to be explicitly listed. Do not use an * here.
 * If you do, app router will break.
 */
export {
  APIKeys,
  CreateOrganization,
  GoogleOneTap,
  OAuthConsent,
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
  TaskSetupMFA,
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
  useOAuthConsent,
  useOrganization,
  useOrganizationCreationDefaults,
  useOrganizationList,
  useReverification,
  useAPIKeys,
  useSession,
  useSessionList,
  useSignIn,
  useSignUp,
  useWaitlist,
  useUser,
} from './client-boundary/hooks';

export { getToken } from '@clerk/shared/getToken';

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
export const Show = ComponentsModule.Show as ServerComponentsServerModuleTypes['Show'];

/**
 * `auth` is not available from this import path.
 *
 * **To fix this error:**
 * ```diff
 * - import { auth } from '@clerk/nextjs'
 * + import { auth } from '@clerk/nextjs/server'
 * ```
 *
 * The `auth` function is only available in server-side contexts:
 * API Routes, Server Components, Server Actions, and Middleware.
 */
export declare const auth: never;
