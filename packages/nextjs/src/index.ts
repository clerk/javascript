/**
 * These need to be explicitly listed. Do not use an * here.
 * If you do, app router will break.
 */
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
import * as ServerHelperModule from '#server-helpers';

import type { ServerComponentsServerModuleTypes } from './components.server';
import type { ServerHelpersServerModuleTypes } from './server-helpers.server';

export {
  RedirectToUserProfile,
  RedirectToSignUp,
  RedirectToSignIn,
  RedirectToOrganizationProfile,
  RedirectToCreateOrganization,
  MultisessionAppSupport,
  ClerkLoading,
  ClerkLoaded,
  AuthenticateWithRedirectCallback,
} from './client-boundary/controlComponents';

/**
 * These need to be explicitly listed. Do not use an * here.
 * If you do, app router will break.
 */
export {
  UserButton,
  UserProfile,
  SignUpButton,
  SignIn,
  SignUp,
  OrganizationSwitcher,
  OrganizationProfile,
  CreateOrganization,
  SignInButton,
} from './client-boundary/uiComponents';

export const ClerkProvider = ComponentsModule.ClerkProvider as ServerComponentsServerModuleTypes['ClerkProvider'];
export const SignedIn = ComponentsModule.SignedIn as ServerComponentsServerModuleTypes['SignedIn'];
export const SignedOut = ComponentsModule.SignedOut as ServerComponentsServerModuleTypes['SignedOut'];

export const auth = ServerHelperModule.auth as ServerHelpersServerModuleTypes['auth'];
export const currentUser = ServerHelperModule.currentUser as ServerHelpersServerModuleTypes['currentUser'];
export const getAuth = ServerHelperModule.getAuth as ServerHelpersServerModuleTypes['getAuth'];
export const clerkClient = ServerHelperModule.clerkClient as ServerHelpersServerModuleTypes['clerkClient'];
export const authMiddleware = ServerHelperModule.authMiddleware as ServerHelpersServerModuleTypes['authMiddleware'];
export const withClerkMiddleware =
  ServerHelperModule.withClerkMiddleware as ServerHelpersServerModuleTypes['withClerkMiddleware'];
