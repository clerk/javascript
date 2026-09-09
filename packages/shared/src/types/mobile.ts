import type { ClientResource } from './client';
import type { EnvironmentResource } from './environment';
import type { Clerk, SetActiveParams, SignOutOptions } from './clerk';
import type { SignInFutureResource } from './signInFuture';
import type { SignUpFutureResource } from './signUpFuture';
import type { SessionResource } from './session';
import type { UserResource } from './user';
import type { OrganizationResource } from './organization';

export type MobileSetActiveParams = Omit<SetActiveParams, 'navigate' | 'redirectUrl'>;
export type MobileSignOutOptions = Omit<SignOutOptions, 'redirectUrl'>;

export type MobileAuthenticationResources = Pick<ClientResource, 'sessions' | 'lastAuthenticationStrategy'> &
  Pick<Clerk, 'telemetry'> & {
    signIn: SignInFutureResource;
    signUp: SignUpFutureResource;
    environment: EnvironmentResource;
  };

export type MobileClerk = Pick<Clerk, 'status' | 'loaded' | 'createOrganization' | 'getOrganization' | 'telemetry'> &
  Pick<ClientResource, 'sessions' | 'lastAuthenticationStrategy'> & {
    readonly environment: EnvironmentResource;
    readonly session: SessionResource | null;
    readonly user: UserResource | null;
    readonly organization: OrganizationResource | null;
    readonly signIn: SignInFutureResource;
    readonly signUp: SignUpFutureResource;
    setActive: (params: MobileSetActiveParams) => ReturnType<Clerk['setActive']>;
    signOut: (options?: MobileSignOutOptions) => ReturnType<Clerk['signOut']>;
  };
