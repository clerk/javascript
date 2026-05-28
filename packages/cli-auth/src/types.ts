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
  /** Per-HTTP-request timeout in ms for token exchange, refresh, revoke, userinfo, and API key verification. Default: 30000 (30s). */
  requestTimeoutMs?: number;
  /** Injected opener for the browser step (for testing). Default: auto-detect. */
  openBrowser?: (url: string) => Promise<void>;
  /** Enables Clerk API key (`ak_*`) auth alongside OAuth. */
  apiKeys?: {
    /**
     * Backend endpoint that verifies an API key and returns the auth payload.
     * Called with `Authorization: Bearer <key>`. API keys can't hit /oauth/userinfo —
     * they need server-side verification (e.g. `clerk.apiKeys.verify()` in your backend).
     */
    verifyEndpoint: string;
    /** Env var to read an API key from (e.g. 'MYAPP_API_KEY'). */
    envVar: string;
  };
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
 * Identity payload returned by Clerk's /oauth/userinfo or an API key verify endpoint.
 * `sub` is the only guaranteed field; everything else depends on scopes and source.
 */
export interface UserInfo {
  sub: string;
  /** Clerk user id. Returned by API key verify; OAuth userinfo puts it in `sub` instead. */
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
  /** Org context. Present for org-scoped API keys, or OAuth sessions where the user picked an org at consent. */
  org_id?: string;
  org_slug?: string;
  org_name?: string;
  org_role?: string;
  org_permissions?: string[];
  [key: string]: unknown;
}

export interface LoginResult {
  tokens: TokenSet;
  user: UserInfo;
}
