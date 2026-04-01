import type { MatchFunction } from '@clerk/shared/pathToRegexp';
import type { PendingSessionOptions } from '@clerk/shared/types';

import type { ApiClient, APIKey, IdPOAuthAccessToken, M2MToken } from '../api';
import type {
  AuthenticatedMachineObject,
  AuthObject,
  InvalidTokenAuthObject,
  SignedInAuthObject,
  SignedOutAuthObject,
  UnauthenticatedMachineObject,
} from './authObjects';
import type { SessionTokenType, TokenType } from './tokenTypes';
import type { VerifyTokenOptions } from './verify';

/**
 * @interface
 */
export type AuthenticateRequestOptions = {
  /**
   * The Clerk Publishable Key from the [**API keys**](https://dashboard.clerk.com/last-active?path=api-keys) page in the Clerk Dashboard.
   */
  publishableKey?: string;
  /**
   * The domain of a [satellite application](https://clerk.com/docs/guides/dashboard/dns-domains/satellite-domains) in a multi-domain setup.
   */
  domain?: string;
  /**
   * Whether the instance is a satellite domain in a multi-domain setup.
   * @default false
   */
  isSatellite?: boolean;
  /**
   * The proxy URL from a multi-domain setup.
   */
  proxyUrl?: string;
  /**
   * The sign-in URL from a multi-domain setup.
   */
  signInUrl?: string;
  /**
   * The sign-up URL from a multi-domain setup.
   */
  signUpUrl?: string;
  /**
   * Full URL or path to navigate to after successful sign in.
   * @default '/'
   */
  afterSignInUrl?: string;
  /**
   * Full URL or path to navigate to after successful sign up.
   * @default '/'
   */
  afterSignUpUrl?: string;
  /**
   * Used to activate a specific [Organization](https://clerk.com/docs/guides/organizations/overview) or [Personal Account](https://clerk.com/docs/guides/dashboard/overview) based on URL path parameters. If there's a mismatch between the Active Organization in the session (e.g., as reported by `auth()`) and the Organization indicated by the URL, an attempt to activate the Organization specified in the URL will be made.
   *
   * If the activation can't be performed, either because an Organization doesn't exist or the user lacks access, the Active Organization in the session won't be changed. Ultimately, it's the responsibility of the page to verify that the resources are appropriate to render given the URL and handle mismatches appropriately (e.g., by returning a 404).
   */
  organizationSyncOptions?: OrganizationSyncOptions;
  /**
   * @internal
   */
  apiClient?: ApiClient;
  /**
   * The type of token to accept.
   * @default 'session_token'
   */
  acceptsToken?: TokenType | TokenType[] | 'any';
  /**
   * The machine secret key to use when verifying machine-to-machine tokens.
   * This will override the Clerk secret key.
   */
  machineSecretKey?: string;
  /**
   * Controls whether satellite apps automatically sync with the primary domain on initial page load.
   *
   * When `false` (default), satellite apps will skip the automatic handshake if no session cookies exist,
   * and only trigger the handshake after an explicit sign-in action. This provides the best performance
   * by showing the satellite app immediately without attempting to sync state first.
   *
   * When `true`, satellite apps will automatically trigger a handshake redirect to sync authentication
   * state with the primary domain on first load, even if no session cookies exist. Use this if you want
   * users who are already signed in on the primary domain to be automatically recognized on the satellite.
   *
   * @default false
   */
  satelliteAutoSync?: boolean;
} & VerifyTokenOptions;

/**
 * @inline
 */
export type OrganizationSyncOptions = {
  /**
   * Specifies URL patterns that are Organization-specific, containing an Organization ID or slug as a path parameter. If a request matches this path, the Organization identifier will be used to set that Organization as active.
   *
   * If the route also matches the `personalAccountPatterns` prop, this prop takes precedence.
   *
   * Patterns must have a path parameter named either `:id` (to match a Clerk Organization ID) or `:slug` (to match a Clerk Organization slug).
   *
   * If the Organization can't be activated—either because it doesn't exist or the user lacks access—the previously active Organization will remain unchanged. Components must detect this case and provide an appropriate error and/or resolution pathway, such as calling `notFound()` or displaying an [`<OrganizationSwitcher />`](https://clerk.com/docs/reference/components/organization/organization-switcher).
   *
   * @example
   * ["/orgs/:slug", "/orgs/:slug/(.*)"]
   * @example
   * ["/orgs/:id", "/orgs/:id/(.*)"]
   * @example
   * ["/app/:any/orgs/:slug", "/app/:any/orgs/:slug/(.*)"]
   */
  organizationPatterns?: Pattern[];

  /**
   * URL patterns for resources that exist within the context of a [Clerk Personal Account](https://clerk.com/docs/guides/dashboard/overview) (user-specific, outside any Organization).
   *
   * If the route also matches the `organizationPattern` prop, the `organizationPattern` prop takes precedence.
   *
   * @example
   * ["/user", "/user/(.*)"]
   * @example
   * ["/user/:any", "/user/:any/(.*)"]
   */
  personalAccountPatterns?: Pattern[];
};

/**
 * A `Pattern` is a `string` that represents the structure of a URL path. In addition to any valid URL, it may include:
 * - Named path parameters prefixed with a colon (e.g., `:id`, `:slug`, `:any`).
 * - Wildcard token, `(.*)`, which matches the remainder of the path.
 *
 * @example
 * /orgs/:slug
 *
 * ```ts
 * '/orgs/acmecorp' // matches (`:slug` value: acmecorp)
 * '/orgs' // does not match
 * '/orgs/acmecorp/settings' // does not match
 * ```
 *
 * @example
 * /app/:any/orgs/:id
 *
 * ```ts
 * '/app/petstore/orgs/org_123' // matches (`:id` value: org_123)
 * '/app/dogstore/v2/orgs/org_123' // does not match
 * ```
 *
 * @example
 * /personal-account/(.*)
 *
 * ```ts
 * '/personal-account/settings' // matches
 * '/personal-account' // does not match
 * ```
 */
type Pattern = string;

export type MachineAuthType = M2MToken | APIKey | IdPOAuthAccessToken;

export type OrganizationSyncTargetMatchers = {
  OrganizationMatcher: MatchFunction<Partial<Record<string, string | string[]>>> | null;
  PersonalAccountMatcher: MatchFunction<Partial<Record<string, string | string[]>>> | null;
};

/**
 * Represents an Organization or a Personal Account - e.g. an
 * entity that can be activated by the handshake API.
 */
export type OrganizationSyncTarget =
  | { type: 'personalAccount' }
  | { type: 'organization'; organizationId?: string; organizationSlug?: string };

/**
 * Infers auth object type from an array of token types.
 * - Session token only -> SessionType
 * - Mixed tokens -> SessionType | MachineType
 * - Machine tokens only -> MachineType
 */
export type InferAuthObjectFromTokenArray<
  T extends readonly TokenType[],
  SessionType extends AuthObject,
  MachineType extends AuthObject,
> = SessionTokenType extends T[number]
  ? T[number] extends SessionTokenType
    ? SessionType
    : SessionType | (MachineType & { tokenType: Exclude<T[number], SessionTokenType> })
  : MachineType & { tokenType: Exclude<T[number], SessionTokenType> };

/**
 * Infers auth object type from a single token type.
 * Returns SessionType for session tokens, or MachineType for machine tokens.
 */
export type InferAuthObjectFromToken<
  T extends TokenType,
  SessionType extends AuthObject,
  MachineType extends AuthObject,
> = T extends SessionTokenType ? SessionType : MachineType & { tokenType: Exclude<T, SessionTokenType> };

export type SessionAuthObject = SignedInAuthObject | SignedOutAuthObject;
export type MachineAuthObject<T extends Exclude<TokenType, SessionTokenType>> = T extends any
  ? AuthenticatedMachineObject<T> | UnauthenticatedMachineObject<T>
  : never;

export type AuthOptions = PendingSessionOptions & { acceptsToken?: AuthenticateRequestOptions['acceptsToken'] };

type MaybePromise<T, IsPromise extends boolean> = IsPromise extends true ? Promise<T> : T;

/**
 * Shared generic overload type for getAuth() helpers across SDKs.
 *
 * - Handles different accepted token types and their corresponding return types.
 */
export interface GetAuthFn<RequestType, ReturnsPromise extends boolean = false> {
  /**
   * @example
   * const auth = await getAuth(req, { acceptsToken: ['session_token', 'api_key'] })
   */
  <T extends TokenType[]>(
    req: RequestType,
    options: AuthOptions & { acceptsToken: T },
  ): MaybePromise<
    | InferAuthObjectFromTokenArray<T, SessionAuthObject, MachineAuthObject<Exclude<T[number], SessionTokenType>>>
    | InvalidTokenAuthObject,
    ReturnsPromise
  >;

  /**
   * @example
   * const auth = await getAuth(req, { acceptsToken: 'session_token' })
   */
  <T extends TokenType>(
    req: RequestType,
    options: AuthOptions & { acceptsToken: T },
  ): MaybePromise<
    InferAuthObjectFromToken<T, SessionAuthObject, MachineAuthObject<Exclude<T, SessionTokenType>>>,
    ReturnsPromise
  >;

  /**
   * @example
   * const auth = await getAuth(req, { acceptsToken: 'any' })
   */
  (req: RequestType, options: AuthOptions & { acceptsToken: 'any' }): MaybePromise<AuthObject, ReturnsPromise>;

  /**
   * @example
   * const auth = await getAuth(req)
   */
  (req: RequestType, options?: PendingSessionOptions): MaybePromise<SessionAuthObject, ReturnsPromise>;
}

/**
 * Shared generic overload type for auth() or getAuth() helpers that don't require a request parameter.
 *
 * - Handles different accepted token types and their corresponding return types.
 * - The SessionAuthType parameter allows frameworks to extend the base SessionAuthObject with additional properties like redirect methods.
 */
export interface GetAuthFnNoRequest<
  SessionAuthType extends SessionAuthObject = SessionAuthObject,
  ReturnsPromise extends boolean = false,
> {
  /**
   * @example
   * const authObject = await auth({ acceptsToken: ['session_token', 'api_key'] })
   */
  <T extends TokenType[]>(
    options: AuthOptions & { acceptsToken: T },
  ): MaybePromise<
    | InferAuthObjectFromTokenArray<T, SessionAuthType, MachineAuthObject<Exclude<T[number], SessionTokenType>>>
    | InvalidTokenAuthObject,
    ReturnsPromise
  >;

  /**
   * @example
   * const authObject = await auth({ acceptsToken: 'session_token' })
   */
  <T extends TokenType>(
    options: AuthOptions & { acceptsToken: T },
  ): MaybePromise<
    InferAuthObjectFromToken<T, SessionAuthType, MachineAuthObject<Exclude<T, SessionTokenType>>>,
    ReturnsPromise
  >;

  /**
   * @example
   * const authObject = await auth({ acceptsToken: 'any' })
   */
  (
    options: AuthOptions & { acceptsToken: 'any' },
  ): MaybePromise<Exclude<AuthObject, SessionAuthObject> | SessionAuthType, ReturnsPromise>;

  /**
   * @example
   * const authObject = await auth()
   */
  (options?: PendingSessionOptions): MaybePromise<SessionAuthType, ReturnsPromise>;
}
