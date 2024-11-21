import type { AuthObject, Organization, Session, User, VerifyTokenOptions } from '@clerk/backend';
import type { RequestState } from '@clerk/backend/internal';
import type {
  LegacyRedirectProps,
  MultiDomainAndOrProxy,
  SignInFallbackRedirectUrl,
  SignInForceRedirectUrl,
  SignUpFallbackRedirectUrl,
  SignUpForceRedirectUrl,
} from '@clerk/types';
import type { DataFunctionArgs, LoaderFunction } from '@remix-run/server-runtime';

export type GetAuthReturn = Promise<AuthObject>;

export type RootAuthLoaderOptions = {
  publishableKey?: string;
  jwtKey?: string;
  secretKey?: string;
  /**
   * @deprecated This option will be removed in the next major version.
   * Use session token claims instead: https://clerk.com/docs/backend-requests/making/custom-session-token
   */
  loadUser?: boolean;
  /**
   * @deprecated This option will be removed in the next major version.
   * Use session token claims instead: https://clerk.com/docs/backend-requests/making/custom-session-token
   */
  loadSession?: boolean;
  /**
   * @deprecated This option will be removed in the next major version.
   * Use session token claims instead: https://clerk.com/docs/backend-requests/making/custom-session-token
   */
  loadOrganization?: boolean;
  authorizedParties?: [];
  signInUrl?: string;
  signUpUrl?: string;
} & Pick<VerifyTokenOptions, 'audience'> &
  MultiDomainAndOrProxy &
  SignInForceRedirectUrl &
  SignInFallbackRedirectUrl &
  SignUpForceRedirectUrl &
  SignUpFallbackRedirectUrl &
  LegacyRedirectProps;

export type RequestStateWithRedirectUrls = RequestState &
  SignInForceRedirectUrl &
  SignInFallbackRedirectUrl &
  SignUpForceRedirectUrl &
  SignUpFallbackRedirectUrl &
  LegacyRedirectProps;

export type RootAuthLoaderCallback<Options extends RootAuthLoaderOptions> = (
  args: LoaderFunctionArgsWithAuth<Options>,
) => RootAuthLoaderCallbackReturn;

type ObjectLike = Record<string, unknown> | null;

/**
 * We are not using `LoaderFunctionReturn` here because we can't support non-object return values. We need to be able to decorate the return value with authentication state, and so we need something object-like.
 *
 * In the case of `null`, we will return an object containing only the authentication state.
 */
export type RootAuthLoaderCallbackReturn = Promise<Response> | Response | Promise<ObjectLike> | ObjectLike;

export type LoaderFunctionArgs = DataFunctionArgs;
export type LoaderFunctionReturn = ReturnType<LoaderFunction>;

export type LoaderFunctionArgsWithAuth<Options extends RootAuthLoaderOptions = any> = LoaderFunctionArgs & {
  request: RequestWithAuth<Options>;
};

export type RequestWithAuth<Options extends RootAuthLoaderOptions = any> = LoaderFunctionArgs['request'] & {
  auth: Omit<AuthObject, 'session' | 'user' | 'organization'>;
} & (Options extends { loadSession: true } ? { session: Session | null } : object) &
  (Options extends { loadUser: true } ? { user: User | null } : object) &
  (Options extends { loadOrganization: true } ? { organization: Organization | null } : object);
