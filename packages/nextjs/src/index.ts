/**
 * These need to be explicitly listed. Do not use an * here.
 * If you do, app router will break.
 */
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

export * from './client';
