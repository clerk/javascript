import type { MatchFunction } from '@clerk/shared/pathToRegexp';
import type { PendingSessionOptions } from '@clerk/types';

import type { ApiClient, APIKey, IdPOAuthAccessToken, MachineToken } from '../api';
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
   * The domain of a [satellite application](https://clerk.com/docs/advanced-usage/satellite-domains) in a multi-domain setup.
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
   * Used to activate a specific [organization](https://clerk.com/docs/organizations/overview) or [personal account](https://clerk.com/docs/organizations/organization-workspaces) based on URL path parameters. If there's a mismatch between the active organization in the session (e.g., as reported by `auth()`) and the organization indicated by the URL, an attempt to activate the organization specified in the URL will be made.
   *
   * If the activation can't be performed, either because an organization doesn't exist or the user lacks access, the active organization in the session won't be changed. Ultimately, it's the responsibility of the page to verify that the resources are appropriate to render given the URL and handle mismatches appropriately (e.g., by returning a 404).
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
} & VerifyTokenOptions;

/**
 * @inline
 */
export type OrganizationSyncOptions = {
  /**
   * Specifies URL patterns that are organization-specific, containing an organization ID or slug as a path parameter. If a request matches this path, the organization identifier will be used to set that org as active.
   *
   * If the route also matches the `personalAccountPatterns` prop, this prop takes precedence.
   *
   * Patterns must have a path parameter named either `:id` (to match a Clerk organization ID) or `:slug` (to match a Clerk organization slug).
   *
   * If the organization can't be activated—either because it doesn't exist or the user lacks access—the previously active organization will remain unchanged. Components must detect this case and provide an appropriate error and/or resolution pathway, such as calling `notFound()` or displaying an [`<OrganizationSwitcher />`](https://clerk.com/docs/components/organization/organization-switcher).
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
   * URL patterns for resources that exist within the context of a [Clerk Personal Account](https://clerk.com/docs/organizations/organization-workspaces) (user-specific, outside any organization).
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

export type MachineAuthType = MachineToken | APIKey | IdPOAuthAccessToken;

export type OrganizationSyncTargetMatchers = {
  OrganizationMatcher: MatchFunction<Partial<Record<string, string | string[]>>> | null;
  PersonalAccountMatcher: MatchFunction<Partial<Record<string, string | string[]>>> | null;
};

/**
 * Represents an organization or a personal account - e.g. an
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

type AuthOptions = PendingSessionOptions & { acceptsToken?: AuthenticateRequestOptions['acceptsToken'] };

type MaybePromise<T, IsPromise extends boolean> = IsPromise extends true ? Promise<T> : T;

/**
 * Shared generic overload type for getAuth() helpers across SDKs.
 *
 * - Parameterized by the request type (RequestType).
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
