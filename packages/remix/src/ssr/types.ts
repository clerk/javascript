import type { AuthObject, Organization, Session, User, VerifyTokenOptions } from '@clerk/backend';
import type { MultiDomainAndOrProxy } from '@clerk/types';
import type { DataFunctionArgs, LoaderFunction } from '@remix-run/server-runtime';

export type GetAuthReturn = Promise<AuthObject>;

export type RootAuthLoaderOptions = {
  /**
   * @deprecated Use `publishableKey` instead.
   */
  frontendApi?: string;
  publishableKey?: string;
  jwtKey?: string;
  /**
   * @deprecated Use `secretKey` instead.
   */
  apiKey?: string;
  secretKey?: string;
  loadUser?: boolean;
  loadSession?: boolean;
  loadOrganization?: boolean;
  authorizedParties?: [];
  signInUrl?: string;
  signUpUrl?: string;
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
} & Pick<VerifyTokenOptions, 'audience'> &
  MultiDomainAndOrProxy;

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
} & (Options extends { loadSession: true } ? { session: Session | null } : {}) &
  (Options extends { loadUser: true } ? { user: User | null } : {}) &
  (Options extends { loadOrganization: true } ? { organization: Organization | null } : {});
