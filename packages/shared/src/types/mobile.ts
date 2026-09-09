import type { BiometricCredentialsResource } from './biometricCredential';
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
    readonly clientId: string | null;
    readonly biometricCredentials: BiometricCredentialsResource;
    readonly authCallback: MobileAuthCallback | null;
    handleAuthCallback: (url: URL) => Promise<MobileAuthenticationResult | null>;
    clearAuthCallback: (id: number) => Promise<void>;
    authenticateWithSSO: (params: MobileSSOParams) => Promise<MobileAuthenticationResult>;
    startAuthentication: (params: MobileIdentifierParams) => Promise<MobileAuthenticationResult>;
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
    readonly clientId: string | null;
    readonly biometricCredentials: BiometricCredentialsResource;
    readonly authCallback: MobileAuthCallback | null;
    handleAuthCallback: (url: URL) => Promise<MobileAuthenticationResult | null>;
    clearAuthCallback: (id: number) => Promise<void>;
    authenticateWithSSO: (params: MobileSSOParams) => Promise<MobileAuthenticationResult>;
    startAuthentication: (params: MobileIdentifierParams) => Promise<MobileAuthenticationResult>;
    readonly signIn: SignInFutureResource;
    readonly signUp: SignUpFutureResource;
    setActive: (params: MobileSetActiveParams) => ReturnType<Clerk['setActive']>;
    signOut: (options?: MobileSignOutOptions) => ReturnType<Clerk['signOut']>;
  };

export type MobileSSOParams = Omit<SignInFutureSSOParams, 'popup' | 'redirectUrl' | 'redirectCallbackUrl'> &
  Pick<SignUpFutureSSOParams, 'unsafeMetadata' | 'legalAccepted' | 'locale' | 'firstName' | 'lastName'> & {
    start: 'auto' | 'signIn' | 'signUp';
    transferable: boolean;
    /** Prefer the platform Google credential picker when available; an empty picker falls back to browser OAuth. */
    preferGoogleOneTap?: boolean;
  };

export type MobileAuthenticationResult =
  | { kind: 'signIn'; signIn: SignInFutureResource }
  | { kind: 'signUp'; signUp: SignUpFutureResource };

export type MobileAuthCallback = { id: number; result: MobileAuthenticationResult };

/** Shared entry behavior for the identifier screen in prebuilt mobile authentication. Does not finalize a session. */
export type MobileIdentifierParams = {
  identifier: string;
  identifierType: 'emailAddress' | 'phoneNumber' | 'username';
  mode: 'signIn' | 'signUp' | 'signInOrUp';
  unsafeMetadata?: SignUpFutureSSOParams['unsafeMetadata'];
};

/** @internal Lifecycle notifications for a projection of an existing mobile core. */
export type MobileAuthResetReason = 'signIn' | 'signUp' | 'signOut';

/** @internal Native views observe this core; they do not synchronize a second client. */
export type MobileResourceObserver = {
  onState(): void;
  onReset(reason: MobileAuthResetReason): void;
};

/** @internal Platform effects for the existing mobile Clerk owner. */
export type MobileNativeHost = {
  platform: 'ios' | 'android';
  callbackUrl: string;
  capabilities: readonly string[];
  request<T>(capability: string, args: unknown): Promise<T>;
  cancelAuthentication(): void;
  invalidateCredentials(): Promise<void>;
};
