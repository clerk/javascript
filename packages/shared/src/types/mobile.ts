import type { ClientResource } from './client';
import type { EnvironmentResource } from './environment';
import type { Clerk, SetActiveParams, SignOutOptions } from './clerk';
import type { SignInFutureSSOParams, SignInFutureResource } from './signInFuture';
import type { SignUpFutureSSOParams, SignUpFutureResource } from './signUpFuture';
import type { SessionResource } from './session';
import type { UserResource } from './user';
import type { OrganizationResource } from './organization';

export type MobileSetActiveParams = Omit<SetActiveParams, 'navigate' | 'redirectUrl'>;
export type MobileSignOutOptions = Omit<SignOutOptions, 'redirectUrl'>;

export type MobileAuthenticationResources = Pick<ClientResource, 'sessions' | 'lastAuthenticationStrategy'> &
  Pick<Clerk, 'telemetry'> & {
    readonly authCallback: MobileAuthCallback | null;
    handleAuthCallback: (url: URL) => Promise<MobileAuthenticationResult | null>;
    clearAuthCallback: (id: number) => Promise<void>;
    authenticateWithSSO: (params: MobileSSOParams) => Promise<MobileAuthenticationResult>;
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
    readonly authCallback: MobileAuthCallback | null;
    handleAuthCallback: (url: URL) => Promise<MobileAuthenticationResult | null>;
    clearAuthCallback: (id: number) => Promise<void>;
    authenticateWithSSO: (params: MobileSSOParams) => Promise<MobileAuthenticationResult>;
    readonly signIn: SignInFutureResource;
    readonly signUp: SignUpFutureResource;
    setActive: (params: MobileSetActiveParams) => ReturnType<Clerk['setActive']>;
    signOut: (options?: MobileSignOutOptions) => ReturnType<Clerk['signOut']>;
  };

export type MobileSSOParams = Omit<SignInFutureSSOParams, 'popup' | 'redirectUrl' | 'redirectCallbackUrl'> &
  Pick<SignUpFutureSSOParams, 'unsafeMetadata' | 'legalAccepted' | 'locale' | 'firstName' | 'lastName'> & {
    start: 'auto' | 'signIn' | 'signUp';
    transferable: boolean;
  };

export type MobileAuthenticationResult =
  | { kind: 'signIn'; signIn: SignInFutureResource }
  | { kind: 'signUp'; signUp: SignUpFutureResource };

export type MobileAuthCallback = { id: number; result: MobileAuthenticationResult };
