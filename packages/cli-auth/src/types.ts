/**
 * Public types for @clerk/cli-auth.
 * This file is the CONTRACT — Codex agents building the implementation
 * and the demo consumer both import from here. Keep signatures stable.
 */

export type StorageKind = 'keychain' | 'file' | 'memory';

export interface CredentialStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export type OAuthScope =
  | 'profile'
  | 'email'
  | 'openid'
  | 'offline_access'
  | 'user:org:read'
  | 'public_metadata'
  | (string & {});

export interface ClerkCliAuthConfig {
  /** OAuth Application client_id from Clerk Dashboard (public client, PKCE). */
  clientId: string;
  /** Frontend API base URL, e.g. https://clerk.myapp.com (no trailing slash). */
  issuer: string;
  /** OAuth scopes to request. Default: ["profile", "email", "openid", "offline_access"]. */
  scopes?: OAuthScope[];
  /** Credential storage strategy. Default: "keychain" (with file fallback). */
  storage?: StorageKind | CredentialStore;
  /** Keychain service name (macOS/Linux/Windows credential manager). Default: "clerk-cli-auth". */
  keychainService?: string;
  /** Environment label to namespace stored tokens. Default: "default". */
  environment?: string;
  /** Override the port the ephemeral callback server binds to. Default: 0 (random). */
  callbackPort?: number;
  /** How long `login()` waits for the user to complete browser sign-in and redirect back to the localhost callback. Default: 120000 (2min). */
  loginTimeoutMs?: number;
  /** Per-HTTP-request timeout in ms for token exchange, refresh, revoke, userinfo, and API key verification. Default: 30000 (30s). */
  requestTimeoutMs?: number;
  /** Injected opener for the browser step (for testing). Default: auto-detect. */
  openBrowser?: (url: string) => Promise<void>;
  /**
   * Backend endpoint that returns the verified `Identity` for a credential (API key
   * or OAuth access token). Called with `Authorization: Bearer <token>`. The server is
   * responsible for verifying the credential (e.g. via `clerk.apiKeys.verify()` from
   * `@clerk/nextjs/server`) and responding with an `Identity` payload — verification
   * stays server-side, never in the CLI. Setting this enables `verifyToken()`.
   */
  identityEndpoint?: string;
  /**
   * Env var to read a non-OAuth credential from (e.g. `'MYAPP_API_KEY'`). When set,
   * `resolveToken()` falls back to this env var before the cached OAuth session.
   */
  tokenEnvVar?: string;
}

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt?: number;
  scope?: string;
  tokenType?: string;
}

/**
 * Verified identity returned by `/oauth/userinfo` or your `identityEndpoint`. Discriminated
 * by the `sub` prefix:
 *
 * - `user_*` → {@link UserIdentity} — a person (OAuth flows + user-scoped API keys)
 * - `org_*` → {@link OrgIdentity} — an org (org-scoped API keys)
 * - `mch_*` → {@link MachineIdentity} — a machine (M2M tokens, machine-scoped API keys)
 * - `scim_*` → {@link ScimIdentity} — a SCIM directory resource
 *
 * Narrow via the {@link isUserIdentity} / {@link isOrgIdentity} / {@link isMachineIdentity} /
 * {@link isScimIdentity} guards.
 */
export type Identity = UserIdentity | OrgIdentity | MachineIdentity | ScimIdentity;

interface IdentityBase {
  sub: string;
  /** Arbitrary additional claims surfaced by the issuer or your identity endpoint. */
  [key: string]: unknown;
}

/** A person — OAuth subjects and user-scoped API keys. */
export interface UserIdentity extends IdentityBase {
  /** Clerk user id. Returned by identity endpoints; OAuth `/oauth/userinfo` puts it in `sub` instead. */
  user_id?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  preferred_username?: string;
  username?: string;
  public_metadata?: Record<string, unknown>;
  unsafe_metadata?: Record<string, unknown>;
  /** Org context. Present when the user authenticated in an org scope. */
  org_id?: string;
  org_slug?: string;
  org_name?: string;
  org_role?: string;
  org_permissions?: string[];
}

/** An organization — org-scoped API keys. */
export interface OrgIdentity extends IdentityBase {
  org_id?: string;
  org_slug?: string;
  org_name?: string;
}

/** A machine — M2M tokens, machine-scoped API keys. */
export type MachineIdentity = IdentityBase;

/** A SCIM directory resource. */
export type ScimIdentity = IdentityBase;

/** True if `identity.sub` starts with `user_`. Narrows to {@link UserIdentity}. */
export function isUserIdentity(identity: Identity): identity is UserIdentity {
  return identity.sub.startsWith('user_');
}

/** True if `identity.sub` starts with `org_`. Narrows to {@link OrgIdentity}. */
export function isOrgIdentity(identity: Identity): identity is OrgIdentity {
  return identity.sub.startsWith('org_');
}

/** True if `identity.sub` starts with `mch_`. Narrows to {@link MachineIdentity}. */
export function isMachineIdentity(identity: Identity): identity is MachineIdentity {
  return identity.sub.startsWith('mch_');
}

/** True if `identity.sub` starts with `scim_`. Narrows to {@link ScimIdentity}. */
export function isScimIdentity(identity: Identity): identity is ScimIdentity {
  return identity.sub.startsWith('scim_');
}

export interface LoginResult {
  tokens: TokenSet;
  /** OAuth subjects are always users; typed accordingly. */
  user: UserIdentity;
}
