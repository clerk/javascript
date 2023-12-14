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
/**
 * Conditionally export server-side helpers.
 * This allows to import server-side helpers from the top-level path.
 * We defined the runtime and the type values explicitly,
 * because TS will not recognize the subpath import unless the HOST
 * application sets moduleResolution to 'NodeNext'.
 */
// @ts-ignore
import * as ServerHelperModule from '#server';

import type { ServerComponentsServerModuleTypes } from './components.server';
import type { ServerHelpersServerModuleTypes } from './server-helpers.server';

export const ClerkProvider = ComponentsModule.ClerkProvider as ServerComponentsServerModuleTypes['ClerkProvider'];
export const SignedIn = ComponentsModule.SignedIn as ServerComponentsServerModuleTypes['SignedIn'];
export const SignedOut = ComponentsModule.SignedOut as ServerComponentsServerModuleTypes['SignedOut'];

export const Protect = ComponentsModule.Protect;

export const auth = ServerHelperModule.auth as ServerHelpersServerModuleTypes['auth'];
export const currentUser = ServerHelperModule.currentUser as ServerHelpersServerModuleTypes['currentUser'];
// export const getAuth = ServerHelperModule.getAuth as ServerHelpersServerModuleTypes['getAuth'];
export const clerkClient = ServerHelperModule.clerkClient as ServerHelpersServerModuleTypes['clerkClient'];
export const authMiddleware = ServerHelperModule.authMiddleware as ServerHelpersServerModuleTypes['authMiddleware'];
export const redirectToSignIn =
  ServerHelperModule.redirectToSignIn as ServerHelpersServerModuleTypes['redirectToSignIn'];
export const redirectToSignUp =
  ServerHelperModule.redirectToSignUp as ServerHelpersServerModuleTypes['redirectToSignUp'];
