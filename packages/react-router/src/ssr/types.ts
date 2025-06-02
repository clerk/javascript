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
import type { LoaderFunction, UNSAFE_DataWithResponseInit } from 'react-router';
import type { GetAnnotations } from 'react-router/internal';

type Func = (...args: any[]) => unknown;

type RouteModule = {
  meta?: Func;
  links?: Func;
  headers?: Func;
  loader?: Func;
  clientLoader?: Func;
  action?: Func;
  clientAction?: Func;
  HydrateFallback?: Func;
  default?: Func;
  ErrorBoundary?: Func;
  [key: string]: unknown;
};

type MatchInfo = {
  id: string;
  module: RouteModule;
};

export type RouteInfo = {
  parents: RouteInfo[];
  module: RouteModule;
  matches: Array<MatchInfo>;
  id: unknown;
  file: string;
  path: string;
  params: unknown;
  loaderData: unknown;
  actionData: unknown;
};

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

// TODO: Figure out how to use the Route.LoaderArgs from userland code
export type LoaderFunctionArgs = GetAnnotations<RouteInfo>['LoaderArgs'];
export type LoaderFunctionReturn = ReturnType<LoaderFunction>;

export type LoaderFunctionArgsWithAuth<Options extends RootAuthLoaderOptions = any> = LoaderFunctionArgs & {
  request: RequestWithAuth<Options>;
};

export type RequestWithAuth<Options extends RootAuthLoaderOptions = any> = LoaderFunctionArgs['request'] & {
  auth: Omit<SignedInAuthObject | SignedOutAuthObject, 'session' | 'user' | 'organization'>;
} & (Options extends { loadSession: true } ? { session: Session | null } : object) &
  (Options extends { loadUser: true } ? { user: User | null } : object) &
  (Options extends { loadOrganization: true } ? { organization: Organization | null } : object);
