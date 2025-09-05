import type { Organization, Session, User, VerifyTokenOptions } from '@clerk/backend';
import type { RequestState, SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend/internal';
import type {
  LegacyRedirectProps,
  MultiDomainAndOrProxy,
  SignInFallbackRedirectUrl,
  SignInForceRedirectUrl,
  SignUpFallbackRedirectUrl,
  SignUpForceRedirectUrl,
} from '@clerk/types';
import type { LoaderFunction, LoaderFunctionArgs, UNSAFE_DataWithResponseInit } from 'react-router';

export type GetAuthReturn = Promise<SignedInAuthObject | SignedOutAuthObject>;

export type RootAuthLoaderOptions = {
  /**
   * Used to override the default VITE_CLERK_PUBLISHABLE_KEY env variable if needed.
   */
  publishableKey?: string;
  /**
   * Used to override the CLERK_JWT_KEY env variable if needed.
   */
  jwtKey?: string;
  /**
   * Used to override the CLERK_SECRET_KEY env variable if needed.
   */
  secretKey?: string;
  /**
   * Used to override the CLERK_MACHINE_SECRET_KEY env variable if needed.
   */
  machineSecretKey?: string;
  /**
   * @deprecated Use [session token claims](https://clerk.com/docs/backend-requests/making/custom-session-token) instead.
   */
  loadUser?: boolean;
  /**
   * @deprecated Use [session token claims](https://clerk.com/docs/backend-requests/making/custom-session-token) instead.
   */
  loadSession?: boolean;
  /**
   * @deprecated Use [session token claims](https://clerk.com/docs/backend-requests/making/custom-session-token) instead.
   */
  loadOrganization?: boolean;
  signInUrl?: string;
  signUpUrl?: string;
} & Pick<VerifyTokenOptions, 'audience' | 'authorizedParties'> &
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
type RootAuthLoaderCallbackReturn =
  | Promise<Response>
  | Response
  | Promise<ObjectLike>
  | ObjectLike
  | UNSAFE_DataWithResponseInit<unknown>
  | Promise<UNSAFE_DataWithResponseInit<unknown>>;

export type LoaderFunctionReturn = ReturnType<LoaderFunction>;

export type LoaderFunctionArgsWithAuth<Options extends RootAuthLoaderOptions = any> = LoaderFunctionArgs & {
  request: RequestWithAuth<Options>;
};

export type RequestWithAuth<Options extends RootAuthLoaderOptions = any> = LoaderFunctionArgs['request'] & {
  auth: Omit<SignedInAuthObject | SignedOutAuthObject, 'session' | 'user' | 'organization'>;
} & (Options extends { loadSession: true } ? { session: Session | null } : object) &
  (Options extends { loadUser: true } ? { user: User | null } : object) &
  (Options extends { loadOrganization: true } ? { organization: Organization | null } : object);
