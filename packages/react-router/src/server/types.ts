import type { Organization, Session, User, VerifyTokenOptions } from '@clerk/backend';
import type {
  OrganizationSyncOptions,
  RequestState,
  SignedInAuthObject,
  SignedOutAuthObject,
} from '@clerk/backend/internal';
import type {
  MultiDomainAndOrProxyPrimitives,
  SignInFallbackRedirectUrl,
  SignInForceRedirectUrl,
  SignUpFallbackRedirectUrl,
  SignUpForceRedirectUrl,
} from '@clerk/shared/types';
import type { LoaderFunction, LoaderFunctionArgs, UNSAFE_DataWithResponseInit } from 'react-router';

export type GetAuthReturn = Promise<SignedInAuthObject | SignedOutAuthObject>;

export type ClerkMiddlewareOptions = {
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
  signInUrl?: string;
  signUpUrl?: string;
  /**
   * Used to activate a specific [Organization](https://clerk.com/docs/guides/organizations/overview) or [Personal Account](https://clerk.com/docs/guides/dashboard/overview) based on URL path parameters. If there's a mismatch between the Active Organization in the session (e.g., as reported by `auth()`) and the Organization indicated by the URL, an attempt to activate the Organization specified in the URL will be made.
   *
   * If the activation can't be performed, either because an Organization doesn't exist or the user lacks access, the Active Organization in the session won't be changed. Ultimately, it's the responsibility of the page to verify that the resources are appropriate to render given the URL and handle mismatches appropriately (e.g., by returning a 404).
   */
  organizationSyncOptions?: OrganizationSyncOptions;
} & Pick<VerifyTokenOptions, 'audience' | 'authorizedParties'> &
  MultiDomainAndOrProxyPrimitives &
  SignInForceRedirectUrl &
  SignInFallbackRedirectUrl &
  SignUpForceRedirectUrl &
  SignUpFallbackRedirectUrl;

export type RootAuthLoaderOptions = ClerkMiddlewareOptions & {
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
};

export type RequestStateWithRedirectUrls = RequestState &
  SignInForceRedirectUrl &
  SignInFallbackRedirectUrl &
  SignUpForceRedirectUrl &
  SignUpFallbackRedirectUrl;

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
