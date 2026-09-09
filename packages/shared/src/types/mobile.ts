import type { EnvironmentResource } from './environment';
import type { UserSettingsResource } from './userSettings';
import type { Clerk, SetActiveParams, SignOutOptions } from './clerk';
import type { SignInFutureResource } from './signInFuture';
import type { SignUpFutureResource } from './signUpFuture';
import type { SessionResource } from './session';
import type { UserResource } from './user';
import type { OrganizationResource } from './organization';

export type MobileSetActiveParams = Omit<SetActiveParams, 'navigate' | 'redirectUrl'>;
export type MobileSignOutOptions = Omit<SignOutOptions, 'redirectUrl'>;

// The server sends only configured social providers despite the wider mapped source type.
export type MobileUserSettings = Omit<UserSettingsResource, 'social' | 'reload'> & {
  social: Partial<UserSettingsResource['social']>;
};

export type MobileEnvironment = Pick<
  EnvironmentResource,
  'organizationSettings' | 'authConfig' | 'displayConfig' | 'maintenanceMode'
> & {
  userSettings: MobileUserSettings;
};

export type MobileAuthenticationResources = {
  signIn: SignInFutureResource;
  signUp: SignUpFutureResource;
  environment: MobileEnvironment;
};

export type MobileClerk = Pick<Clerk, 'status' | 'loaded' | 'createOrganization' | 'getOrganization'> & {
  readonly environment: MobileEnvironment;
  readonly session: SessionResource | null;
  readonly user: UserResource | null;
  readonly organization: OrganizationResource | null;
  readonly signIn: SignInFutureResource;
  readonly signUp: SignUpFutureResource;
  setActive: (params: MobileSetActiveParams) => ReturnType<Clerk['setActive']>;
  signOut: (options?: MobileSignOutOptions) => ReturnType<Clerk['signOut']>;
};
